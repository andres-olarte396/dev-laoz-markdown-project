const fs = require('fs');
const path = require('path');

const contentDir = path.join(__dirname, '../public/content');

function organizeAudio() {
    console.log('🎧 Iniciando organización de audios...');
    
    // Obtener lista de cursos
    if (!fs.existsSync(contentDir)) {
        console.error('❌ Directorio de contenido no encontrado');
        return;
    }

    const courses = fs.readdirSync(contentDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('teach-laoz'));

    courses.forEach(course => {
        const coursePath = path.join(contentDir, course.name);
        const mediaPath = path.join(coursePath, 'media');
        const modulesPath = path.join(coursePath, 'modulos');

        console.log(`\n📂 Verificando curso: ${course.name}`);

        if (!fs.existsSync(mediaPath)) {
            console.log('   (Sin carpeta media)');
            return;
        }

        if (!fs.existsSync(modulesPath)) {
            console.log('   (Sin carpeta modulos)');
            return;
        }

        // Leer archivos de audio
        const audioFiles = fs.readdirSync(mediaPath).filter(f => f.endsWith('.wav') || f.endsWith('.mp3'));
        console.log(`   Encontrados ${audioFiles.length} archivos de audio en /media`);

        audioFiles.forEach(audioFile => {
            // Intentar extraer pistas: modulo, tema, subtema
            // Ej: modulo_1_tema_1.1_subtema_1.1.1.wav
            
            // Extraer números (ej: 1.1.1)
            const versionMatch = audioFile.match(/(\d+\.\d+(\.\d+)?)/);
            if (!versionMatch) {
                console.log(`   ⚠️  No se pudo extraer versión de: ${audioFile}`);
                return;
            }
            
            const version = versionMatch[0]; // "1.1.1"
            
            // Buscar módulo correspondiente
            // Asumimos que la versión empieza con el número de módulo o hay pista en el nombre
            // Pero mejor buscamos recursivamente en todos los módulos del curso
            
            let foundMatch = false;
            
            // Recorrer directorios de módulos
            const modules = fs.readdirSync(modulesPath, { withFileTypes: true })
                .filter(d => d.isDirectory());

            for (const mod of modules) {
                const modPath = path.join(modulesPath, mod.name);
                
                // Buscar archivos MD en este módulo que contengan la versión
                // Ej: "tema_1.1.1_algo.md"
                const mdFiles = fs.readdirSync(modPath).filter(f => f.endsWith('.md'));
                
                for (const mdFile of mdFiles) {
                    if (mdFile.includes(version)) {
                        // ¡Coincidencia encontrada!
                        const targetName = mdFile.replace('.md', path.extname(audioFile)); // tema_xyz.wav
                        const sourcePath = path.join(mediaPath, audioFile);
                        const targetPath = path.join(modPath, targetName);
                        
                        // Mover archivo
                        try {
                            fs.renameSync(sourcePath, targetPath);
                            console.log(`   ✅ Movido: ${audioFile} -> ${mod.name}/${targetName}`);
                            foundMatch = true;
                        } catch (err) {
                            console.error(`   ❌ Error moviendo ${audioFile}: ${err.message}`);
                        }
                        break; // Deja de buscar MDs
                    }
                }
                if (foundMatch) break; // Deja de buscar módulos
            }

            if (!foundMatch) {
                console.log(`   ⚠️  No se encontró Markdown para: ${audioFile} (v${version})`);
            }
        });
        
        // Limpieza: borrar carpeta media si está vacía
        try {
            if (fs.readdirSync(mediaPath).length === 0) {
                fs.rmdirSync(mediaPath);
                console.log('   🧹 Carpeta media eliminada (vacía)');
            }
        } catch (e) {}
    });
}

organizeAudio();
