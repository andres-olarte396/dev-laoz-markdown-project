$dest = "e:\MyRepos\tools\dev-laoz-markdown-project\public\content"
if (!(Test-Path $dest)) {
    New-Item -ItemType Directory -Force -Path $dest
}

$courses = @(
    "e:\MyRepos\education\teach-laoz\teach-laoz-curso-dibujo-ninos",
    "e:\MyRepos\education\teach-laoz\teach-laoz-curso-sun-tzu-production",
    "e:\MyRepos\education\teach-laoz\teach-laoz-curso_optimizacion_entrenamientos",
    "e:\MyRepos\education\teach-laoz\teach-laoz-curso_principios_solid",
    "e:\MyRepos\education\teach-laoz\teach-laoz-curso_security",
    "e:\MyRepos\education\teach-laoz\teach-laoz-curso_proyecto_vida",
    "e:\MyRepos\education\teach-laoz-courses-generator\cursos\teach-laoz-curso-algebra-preuniversitaria"
)

foreach ($course in $courses) {
    if (Test-Path $course) {
        $courseName = Split-Path $course -Leaf
        $target = Join-Path $dest $courseName
        Write-Host "Copying $courseName..."
        Copy-Item -Path $course -Destination $target -Recurse -Force
    }
    else {
        Write-Warning "Course path not found: $course"
    }
}

Write-Host "All courses copied."
