param($installPath, $toolsPath, $package, $project)
Set-Location -Path $toolsPath

Write-Host "Installing npm packages for TSLint-MSBuild..."

npm install tslint typescript yargs

Write-Host "...Complete!"
