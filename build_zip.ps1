$commit = '6b3463b'
$workDir = 'c:\Users\user\OneDrive - ikastar.com\Desktop\frames41'
Set-Location $workDir

$tempDir = Join-Path $workDir 'temp_commit_6b3463b'
if (Test-Path $tempDir) { Remove-Item -Recurse -Force $tempDir }
New-Item -ItemType Directory -Path $tempDir | Out-Null
New-Item -ItemType Directory -Path (Join-Path $tempDir 'files') | Out-Null

# 1. Commit metadata and summary
git show --stat $commit | Out-File -FilePath (Join-Path $tempDir 'commit_details.txt') -Encoding utf8

# 2. Patch file
git show $commit | Out-File -FilePath (Join-Path $tempDir 'commit_diff.patch') -Encoding utf8

# 3. Changed files list
$files = git diff-tree --no-commit-id --name-only -r $commit

# 4. Copy each file content at commit & build combined code text
$combinedContent = [System.Collections.Generic.List[string]]::new()
$combinedContent.Add("# Commit: feat: implement checkout flow with address selection and payment method integration")
$combinedContent.Add("# Commit Hash: $commit")
$combinedContent.Add("")

foreach ($file in $files) {
    $targetPath = Join-Path (Join-Path $tempDir 'files') $file
    $parentDir = Split-Path $targetPath -Parent
    if (-not (Test-Path $parentDir)) {
        New-Item -ItemType Directory -Path $parentDir -Force | Out-Null
    }
    
    # Save individual file at commit state
    $fileLines = git show "${commit}:${file}"
    [System.IO.File]::WriteAllLines($targetPath, $fileLines)
    
    # Append to combined text
    $combinedContent.Add("================================================================================")
    $combinedContent.Add("FILE: $file")
    $combinedContent.Add("================================================================================")
    foreach ($line in $fileLines) {
        $combinedContent.Add($line)
    }
    $combinedContent.Add("")
}

[System.IO.File]::WriteAllLines((Join-Path $tempDir 'commit_files_and_code.txt'), $combinedContent)

# Compress directory
$zipPath = Join-Path $workDir 'checkout_flow_commit_6b3463b.zip'
if (Test-Path $zipPath) { Remove-Item -Force $zipPath }
Compress-Archive -Path (Join-Path $tempDir '*') -DestinationPath $zipPath -Force

Remove-Item -Recurse -Force $tempDir
Write-Host "SUCCESS: Created $zipPath"
