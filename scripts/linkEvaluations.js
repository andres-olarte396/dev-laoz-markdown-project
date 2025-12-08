const fs = require('fs');
const path = require('path');
const dbService = require('../src/services/dbService');
const logger = require('../src/utils/logger');

const contentDir = path.join(__dirname, '../public/content');

async function linkEvaluations() {
    try {
        await dbService.init();
        console.log('🔗 Iniciando vinculación de evaluaciones...');

        // Obtener todos los temas actuales
        const topics = await dbService.all('SELECT * FROM topics');
        
        // Separar en "Contenido" y "Evaluaciones" basado en nombre o path
        const contentTopics = [];
        const evalTopics = [];

        topics.forEach(t => {
            const fileName = path.basename(t.file_path).toLowerCase();
            if (fileName.includes('evaluacion') || t.title.toLowerCase().includes('evaluación')) {
                evalTopics.push(t);
            } else {
                contentTopics.push(t);
            }
        });

        console.log(`📊 Detectados: ${contentTopics.length} temas de contenido, ${evalTopics.length} posibles evaluaciones.`);

        let linkedCount = 0;

        for (const evalTopic of evalTopics) {
            // Intentar extraer identificador (ej: "tema_1.2") del nombre de archivo
            const evalFileName = path.basename(evalTopic.file_path);
            const match = evalFileName.match(/(tema_\d+(\.\d+)*)/i);
            
            if (match) {
                const prefix = match[1]; // ej: "tema_1.2"
                
                // Buscar tema de contenido en el Mismo Módulo que tenga ese prefijo
                const parent = contentTopics.find(t => 
                    t.module_id === evalTopic.module_id && 
                    path.basename(t.file_path).includes(prefix)
                );

                if (parent) {
                    console.log(`   🔗 Vinculando: [${evalFileName}] -> [${path.basename(parent.file_path)}]`);
                    
                    // 1. Actualizar tema padre con el path de la evaluación
                    // Nota: el path debe ser relativo a contentDir
                    const relativeEvalPath = evalTopic.file_path; 
                    
                    await dbService.run(
                        'UPDATE topics SET evaluation_path = ? WHERE id = ?',
                        [relativeEvalPath, parent.id]
                    );

                    // 2. Eliminar el topic de evaluación para que no salga en el menú
                    await dbService.run('DELETE FROM topics WHERE id = ?', [evalTopic.id]);
                    
                    linkedCount++;
                } else {
                    console.log(`   ⚠️  Huérfano (sin padre local): ${evalFileName}`);
                }
            } else {
                // Caso especial: Evaluaciones en carpeta "Evaluaciones" sin prefijo claro
                // O evaluaciones globales del módulo
                console.log(`   ⚠️  Sin prefijo claro: ${evalFileName}`);
            }
        }

        console.log(`\n✅ Vinculación completada. ${linkedCount} evaluaciones asociadas.`);

    } catch (error) {
        console.error('Error:', error);
    }
}

linkEvaluations();
