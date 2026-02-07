$path = 'C:\Users\diego\Diktalo\utils\blogData.ts';
$lines = Get-Content $path;
$header = $lines[0..2];
$remaining = $lines[107..($lines.Count - 1)];
$newLines = $header + $remaining;
$newLines | Out-File -FilePath $path -Encoding utf8;
