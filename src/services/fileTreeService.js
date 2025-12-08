const fs = require('fs');
const path = require('path');
const dbService = require('./dbService');

const contentDir = path.join(__dirname, '../public/content');

function buildTree(dir, topicsMap, progressMap) {
    const stats = fs.statSync(dir);
    const relativePath = path.relative(path.join(__dirname, '../public'), dir).replace(/\\/g, '/');
    
    const info = {
        name: path.basename(dir),
        path: relativePath,
        isDirectory: stats.isDirectory(),
    };

    // Enrich with DB data if it's a file
    if (!info.isDirectory) {
        // Find topic by file_path
        // Database stores paths like 'course\module\topic.md', relativePath is 'content\course\...' or similar
        // Let's normalize
        const dbKey = relativePath.startsWith('content/') ? relativePath.substring(8) : relativePath;
        
        // Try to find matching topic in map (handling slash/backslash differences)
        const topic = topicsMap.find(t => {
            const tPath = (t.file_path || '').replace(/\\/g, '/');
            return tPath === dbKey || tPath === relativePath;
        });

        if (topic) {
            info.id = topic.id;
            info.title = topic.title || info.name; // Use Display Title
            info.hasAudio = !!topic.audio_path;
            info.hasEvaluation = !!topic.evaluation_path;
            
            // Check progress
            info.completed = progressMap.has(topic.id) ? progressMap.get(topic.id).completed : false;
        }
    }

    if (stats.isDirectory()) {
        info.children = fs.readdirSync(dir)
            .filter(child => !child.startsWith('.'))
            .map(child => buildTree(path.join(dir, child), topicsMap, progressMap));
            
        // Sort: Directories first, then files
        info.children.sort((a, b) => {
            if (a.isDirectory === b.isDirectory) {
                return a.name.localeCompare(b.name);
            }
            return a.isDirectory ? -1 : 1;
        });
    }
    return info;
}

async function getMenu(userId = 1) {
    if (!fs.existsSync(contentDir)) return [];
    
    try {
        // Fetch all topics and progress in parallel
        await dbService.init(); // Ensure DB is ready
        const topics = await dbService.all('SELECT * FROM topics');
        const progress = await dbService.all('SELECT * FROM topic_progress WHERE user_id = ?', [userId]);
        
        // Create lookup maps
        // topics is array
        const progressMap = new Map();
        progress.forEach(p => progressMap.set(p.topic_id, p));

        const rootTree = buildTree(contentDir, topics, progressMap);
        return rootTree.children || [];
        
    } catch (error) {
        console.error('Error building enriched menu:', error);
        // Fallback to simple tree if DB fails
        return buildSimpleTree(contentDir).children || [];
    }
}

function buildSimpleTree(dir) {
    const stats = fs.statSync(dir);
    const info = {
        name: path.basename(dir),
        path: path.relative(path.join(__dirname, '../public'), dir).replace(/\\/g, '/'),
        isDirectory: stats.isDirectory(),
    };
    if (stats.isDirectory()) {
        info.children = fs.readdirSync(dir)
            .filter(c => !c.startsWith('.'))
            .map(c => buildSimpleTree(path.join(dir, c)));
    }
    return info;
}

module.exports = { getMenu };
