<?php

declare(strict_types=1);

use App\Models\AdminManagement\Admin;
use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Tier 1 Post-Development QA Runner (On-Demand, Rollback-Safe).
 *
 * Usage examples:
 *   php .agents/scripts/qa-kernel.php --html="/driver-withdrawals,/reports/driver-insentifs"
 *   php .agents/scripts/qa-kernel.php --json="/driver-withdrawals/data,/master-data/drivers/data"
 *   php .agents/scripts/qa-kernel.php --excel="/reports/driver-insentifs/export"
 */

$basePath = dirname(__DIR__, 2);
require $basePath . '/vendor/autoload.php';

$app = require $basePath . '/bootstrap/app.php';
$app->instance('request', Request::create('http://localhost:8000/', 'GET'));
$kernel = $app->make(Kernel::class);
$kernel->bootstrap();

$options = getopt('', ['html::', 'json::', 'excel::', 'user::']);
$username = $options['user'] ?? 'superahmad';

$parseList = static function (?string $raw): array {
    if ($raw === null || trim($raw) === '') {
        return [];
    }
    return array_values(array_filter(array_map('trim', explode(',', $raw)), static fn ($v) => $v !== ''));
};

$htmlUrls = $parseList($options['html'] ?? null);
$jsonUrls = $parseList($options['json'] ?? null);
$excelUrls = $parseList($options['excel'] ?? null);

if (empty($htmlUrls) && empty($jsonUrls) && empty($excelUrls)) {
    fwrite(STDERR, "Usage: php .agents/scripts/qa-kernel.php [--html=url1,url2] [--json=url1,url2] [--excel=url1] [--user=superahmad]\n");
    exit(2);
}

$admin = Admin::where('username', $username)->first();
if (!$admin) {
    fwrite(STDERR, "[FAIL] Admin user '{$username}' tidak ditemukan.\n");
    exit(1);
}

$results = [];
$hasFailure = false;

$detectRawHtmlInJson = static function ($data, string $prefix = '') use (&$detectRawHtmlInJson): array {
    $hits = [];
    if (is_array($data)) {
        foreach ($data as $key => $value) {
            $path = $prefix === '' ? (string) $key : "{$prefix}.{$key}";
            $hits = array_merge($hits, $detectRawHtmlInJson($value, $path));
            if (count($hits) >= 3) {
                break;
            }
        }
    } elseif (is_string($data)) {
        if (preg_match('/<(span|div|a|button|i|table|tr|td|badge)\b[^>]*>/i', $data)) {
            $hits[] = $prefix;
        }
    }
    return $hits;
};

$dispatch = static function (string $url, bool $ajax = false) use ($kernel, $admin) {
    Auth::guard('web')->login($admin);
    $headers = [
        'HTTP_HOST' => 'localhost:8000',
        'HTTP_ACCEPT' => $ajax ? 'application/json' : 'text/html,application/xhtml+xml',
    ];
    if ($ajax) {
        $headers['HTTP_X_REQUESTED_WITH'] = 'XMLHttpRequest';
    }
    $request = Request::create($url, 'GET', [], [], [], $headers);
    return $kernel->handle($request);
};

DB::beginTransaction();
try {
    foreach ($htmlUrls as $url) {
        $start = microtime(true);
        $response = $dispatch($url, false);
        $ms = (int) round((microtime(true) - $start) * 1000);
        $status = $response->getStatusCode();
        $content = (string) $response->getContent();
        $ok = ($status === 200) && strlen($content) > 200 && !str_contains($content, 'Illuminate\\Foundation\\Exceptions');
        $note = $ok ? "HTTP {$status} ({$ms}ms)" : "HTTP {$status} (len=" . strlen($content) . ", {$ms}ms)";
        $results[] = ['type' => 'HTML', 'url' => $url, 'pass' => $ok, 'note' => $note];
        if (!$ok) {
            $hasFailure = true;
        }
    }

    foreach ($jsonUrls as $url) {
        $start = microtime(true);
        $response = $dispatch($url, true);
        $ms = (int) round((microtime(true) - $start) * 1000);
        $status = $response->getStatusCode();
        $decoded = json_decode((string) $response->getContent(), true);
        $isValidJson = json_last_error() === JSON_ERROR_NONE && is_array($decoded);
        $htmlHits = $isValidJson ? $detectRawHtmlInJson($decoded) : [];
        $ok = ($status === 200) && $isValidJson && empty($htmlHits);

        if (!$isValidJson) {
            $note = "HTTP {$status}, invalid JSON ({$ms}ms)";
        } elseif (!empty($htmlHits)) {
            $note = "HTTP {$status}, RAW HTML terdeteksi di: " . implode(', ', $htmlHits);
        } else {
            $count = isset($decoded['data']) && is_array($decoded['data']) ? count($decoded['data']) : count($decoded);
            $note = "HTTP {$status}, JSON murni, items={$count} ({$ms}ms)";
        }

        $results[] = ['type' => 'JSON', 'url' => $url, 'pass' => $ok, 'note' => $note];
        if (!$ok) {
            $hasFailure = true;
        }
    }

    foreach ($excelUrls as $url) {
        $start = microtime(true);
        $response = $dispatch($url, false);
        $ms = (int) round((microtime(true) - $start) * 1000);
        $status = $response->getStatusCode();
        $contentType = (string) $response->headers->get('Content-Type', '');
        $body = '';

        if ($response instanceof StreamedResponse) {
            ob_start();
            $response->sendContent();
            $body = (string) ob_get_clean();
        } elseif ($response instanceof BinaryFileResponse) {
            $file = $response->getFile();
            $body = $file && $file->isReadable() ? (string) file_get_contents($file->getPathname()) : '';
        } else {
            $body = (string) $response->getContent();
        }

        $isXlsx = str_starts_with($body, 'PK') && strlen($body) > 100;
        $ok = ($status === 200) && $isXlsx;
        $note = $ok
            ? "HTTP {$status}, valid XLSX (" . strlen($body) . " bytes, {$ms}ms)"
            : "HTTP {$status}, invalid XLSX (type={$contentType}, bytes=" . strlen($body) . ")";

        $results[] = ['type' => 'XLSX', 'url' => $url, 'pass' => $ok, 'note' => $note];
        if (!$ok) {
            $hasFailure = true;
        }
    }
} finally {
    DB::rollBack();
}

echo "=== TIER 1 QA KERNEL REPORT (user={$username}, rollback=SAFE) ===\n";
foreach ($results as $row) {
    $badge = $row['pass'] ? 'PASS' : 'FAIL';
    echo sprintf("[%s] %-4s %-45s | %s\n", $badge, $row['type'], $row['url'], $row['note']);
}
echo "=== SUMMARY: " . ($hasFailure ? 'FAILED' : 'ALL PASSED') . " ===\n";

exit($hasFailure ? 1 : 0);
