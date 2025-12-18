/**
 * Course Service
 * Handles course discovery, parsing, and management
 */

const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger");
const dbService = require("./dbService");

class CourseService {
  constructor() {
    this.contentDir = path.join(__dirname, "../../public/content");
    this.courseCache = new Map();
  }

  /**
   * Scan and discover all teach-laoz courses
   */
  async scanCourses() {
    try {
      logger.info("Scanning for courses...");

      if (!fs.existsSync(this.contentDir)) {
        logger.warn(`Content directory not found: ${this.contentDir}`);
        return [];
      }

      const entries = fs.readdirSync(this.contentDir, { withFileTypes: true });
      const courses = [];

      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith("teach-laoz")) {
          const coursePath = path.join(this.contentDir, entry.name);
          const courseData = await this.parseCourse(entry.name, coursePath);

          if (courseData) {
            courses.push(courseData);

            // Save to database
            await dbService.upsertCourse(courseData);

            // Parse and save modules
            await this.parseAndSaveModules(courseData.id, coursePath);
          }
        }
      }

      logger.info(`Found ${courses.length} courses`);
      return courses;
    } catch (error) {
      logger.error("Error scanning courses:", error);
      throw error;
    }
  }

  /**
   * Parse course metadata
   */
  async parseCourse(courseId, coursePath) {
    try {
      const readmePath = path.join(coursePath, "README.md");
      const courseJsonPath = path.join(coursePath, "course.json");

      let courseData = {
        id: courseId,
        title: this.formatCourseTitle(courseId),
        description: "",
        level: "Intermedio",
        duration_hours: 0,
        total_modules: 0,
        author: "",
        version: "1.0.0",
        cover_image: null,
      };

      // Try to read course.json first
      if (fs.existsSync(courseJsonPath)) {
        const jsonData = JSON.parse(fs.readFileSync(courseJsonPath, "utf-8"));
        courseData = { ...courseData, ...jsonData };
      }
      // Otherwise parse README.md
      else if (fs.existsSync(readmePath)) {
        const readme = fs.readFileSync(readmePath, "utf-8");
        courseData = this.parseReadmeMetadata(readme, courseData);
      }

      // Count modules
      const modulesDir = path.join(coursePath, "modulos");
      if (fs.existsSync(modulesDir)) {
        const modules = fs
          .readdirSync(modulesDir, { withFileTypes: true })
          .filter(
            (entry) => entry.isDirectory() && entry.name.startsWith("modulo")
          );
        courseData.total_modules = modules.length;
      }

      logger.info(`Parsed course: ${courseData.title}`);
      return courseData;
    } catch (error) {
      logger.error(`Error parsing course ${courseId}:`, error);
      return null;
    }
  }

  /**
   * Parse README.md for metadata
   */
  parseReadmeMetadata(readme, defaultData) {
    const lines = readme.split("\n");
    const data = { ...defaultData };

    // Extract title from first heading
    const titleMatch = readme.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      data.title = titleMatch[1].trim();
    }

    // Extract description (first paragraph after title)
    const descMatch = readme.match(/^#.+\n\n(.+?)(\n\n|$)/s);
    if (descMatch) {
      data.description = descMatch[1].trim();
    }

    return data;
  }

  /**
   * Format course ID to readable title
   */
  formatCourseTitle(courseId) {
    return courseId
      .replace("teach-laoz-", "")
      .replace(/_/g, " ")
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  }

  /**
   * Parse and save modules for a course
   */
  async parseAndSaveModules(courseId, coursePath) {
    try {
      console.log(`DEBUG: Parsing modules for ${courseId}`);
      console.log(`DEBUG: Course Path: ${coursePath}`);

      const modulesDir = path.join(coursePath, "modulos");
      console.log(`DEBUG: Checking modules dir: ${modulesDir}`);

      if (!fs.existsSync(modulesDir)) {
        console.log(`DEBUG: Modules dir NOT FOUND`);
        logger.warn(
          `No modules directory found for ${courseId} at ${modulesDir}`
        );
        return;
      }
      console.log(`DEBUG: Modules dir EXISTS`);

      const moduleEntries = fs
        .readdirSync(modulesDir, { withFileTypes: true })
        .filter(
          (entry) => entry.isDirectory() && entry.name.startsWith("modulo")
        )
        .sort((a, b) => {
          // Extract module numbers for proper numeric sorting
          const numA = parseInt(a.name.match(/modulo[ _-]?(\d+)/i)?.[1] || "0");
          const numB = parseInt(b.name.match(/modulo[ _-]?(\d+)/i)?.[1] || "0");
          return numA - numB;
        });

      logger.info(`Found ${moduleEntries.length} modules for ${courseId}`);

      for (let i = 0; i < moduleEntries.length; i++) {
        const moduleEntry = moduleEntries[i];
        const modulePath = path.join(modulesDir, moduleEntry.name);

        // Extract number intelligently (handles 'modulo1', 'modulo_1', 'modulo-1', etc.)
        const numberMatch = moduleEntry.name.match(/modulo[ _-]?(\d+)/i);
        const moduleNumber = numberMatch ? parseInt(numberMatch[1]) : i;

        if (isNaN(moduleNumber)) {
          logger.warn(
            `Could not parse module number from ${moduleEntry.name}, using index ${i}`
          );
        }

        const moduleData = {
          id: `${courseId}/${moduleEntry.name}`,
          course_id: courseId,
          module_number: moduleNumber,
          title: await this.getModuleTitle(modulePath),
          description: "",
          order_index: i,
        };

        logger.info(`Saving module: ${moduleData.id} - ${moduleData.title}`);
        await dbService.upsertModule(moduleData);
        logger.info(`✓ Module saved: ${moduleData.id}`);

        // Parse topics
        await this.parseAndSaveTopics(moduleData.id, modulePath);
      }

      logger.info(
        `✓ Completed parsing ${moduleEntries.length} modules for ${courseId}`
      );
    } catch (error) {
      logger.error(`Error parsing modules for ${courseId}:`, error);
      logger.error("Stack:", error.stack);
    }
  }

  /**
   * Get module title from Presentacion.md
   */
  async getModuleTitle(modulePath) {
    const presentacionPath = path.join(modulePath, "Presentacion.md");

    if (fs.existsSync(presentacionPath)) {
      const content = fs.readFileSync(presentacionPath, "utf-8");
      const titleMatch = content.match(/^#\s+(.+)$/m);
      if (titleMatch) {
        return titleMatch[1].trim();
      }
    }

    // Fallback to directory name
    return path.basename(modulePath).replace("modulo", "Módulo ");
  }

  /**
   * Parse and save topics for a module
   */
  async parseAndSaveTopics(moduleId, modulePath) {
    try {
      console.log(`DEBUG: Parsing topics for ${moduleId} in ${modulePath}`);
      const rawFiles = fs.readdirSync(modulePath, { withFileTypes: true });
      console.log(`DEBUG: found ${rawFiles.length} raw entries`);
      rawFiles.forEach((f) =>
        console.log(` - ${f.name} (isFile: ${f.isFile()})`)
      );

      const files = rawFiles
        .filter((entry) => entry.isFile() && entry.name.endsWith(".md"))
        // Filter out auxiliary files that shouldn't be standalone topics
        .filter(
          (entry) =>
            !entry.name.endsWith("_guion.md") &&
            !entry.name.endsWith("_evaluacion.md")
        )
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(`DEBUG: Filtered files count: ${files.length}`);
      fs.appendFileSync(
        "debug_scan.log",
        `Module ${moduleId} - Filtered files: ${files.length}\n`
      );
      files.forEach((f) =>
        fs.appendFileSync("debug_scan.log", `  - ${f.name}\n`)
      );

      let orderIndex = 0;

      for (const file of files) {
        try {
          console.log(
            `DEBUG: Processing file ${file.name} in module ${moduleId}`
          );
          const topicId = `${moduleId}/${file.name.replace(".md", "")}`;
          const filePath = path.join(modulePath, file.name);

          // Check for associated audio file (mp3, wav, or m4a)
          const mp3Name = file.name.replace(".md", ".mp3");
          const wavName = file.name.replace(".md", ".wav");
          const m4aName = file.name.replace(".md", ".m4a");

          // Alternative pattern: tema_X_contenido.md -> tema_X_audio.wav/mp3/m4a
          const altWavName = file.name
            .replace("_contenido.md", "_audio.wav")
            .replace(".md", "_audio.wav");
          const altMp3Name = file.name
            .replace("_contenido.md", "_audio.mp3")
            .replace(".md", "_audio.mp3");
          const altM4aName = file.name
            .replace("_contenido.md", "_audio.m4a")
            .replace(".md", "_audio.m4a");

          // Pattern for guion files: tema_X_contenido.md -> tema_X_guion.m4a
          const guionM4aName = file.name
            .replace("_contenido.md", "_guion.m4a")
            .replace(".md", "_guion.m4a");
          const guionMp3Name = file.name
            .replace("_contenido.md", "_guion.mp3")
            .replace(".md", "_guion.mp3");
          const guionWavName = file.name
            .replace("_contenido.md", "_guion.wav")
            .replace(".md", "_guion.wav");

          // Simple pattern: tema_X_contenido.md -> tema_X.wav (fixes module 0 and 1 audio)
          const simpleWavName = file.name.replace("_contenido.md", ".wav");
          const simpleMp3Name = file.name.replace("_contenido.md", ".mp3");

          const mp3Path = path.join(modulePath, mp3Name);
          const wavPath = path.join(modulePath, wavName);
          const m4aPath = path.join(modulePath, m4aName);
          const altWavPath = path.join(modulePath, altWavName);
          const altMp3Path = path.join(modulePath, altMp3Name);
          const altM4aPath = path.join(modulePath, altM4aName);
          const guionM4aPath = path.join(modulePath, guionM4aName);
          const guionMp3Path = path.join(modulePath, guionMp3Name);
          const guionWavPath = path.join(modulePath, guionWavName);
          const simpleWavPath = path.join(modulePath, simpleWavName);
          const simpleMp3Path = path.join(modulePath, simpleMp3Name);

          let relativeAudioPath = null;

          // Check all possible audio file patterns
          if (fs.existsSync(mp3Path)) {
            console.log(`DEBUG: Found MP3 for ${file.name}`);
            relativeAudioPath = path.relative(this.contentDir, mp3Path);
          } else if (fs.existsSync(wavPath)) {
            console.log(`DEBUG: Found WAV for ${file.name}`);
            relativeAudioPath = path.relative(this.contentDir, wavPath);
          } else if (fs.existsSync(m4aPath)) {
            console.log(`DEBUG: Found M4A for ${file.name}`);
            relativeAudioPath = path.relative(this.contentDir, m4aPath);
          } else if (fs.existsSync(altWavPath)) {
            console.log(`DEBUG: Found Alt WAV for ${file.name}`);
            relativeAudioPath = path.relative(this.contentDir, altWavPath);
          } else if (fs.existsSync(altMp3Path)) {
            console.log(`DEBUG: Found Alt MP3 for ${file.name}`);
            relativeAudioPath = path.relative(this.contentDir, altMp3Path);
          } else if (fs.existsSync(altM4aPath)) {
            console.log(`DEBUG: Found Alt M4A for ${file.name}`);
            relativeAudioPath = path.relative(this.contentDir, altM4aPath);
          } else if (fs.existsSync(guionM4aPath)) {
            console.log(`DEBUG: Found Guion M4A for ${file.name}`);
            relativeAudioPath = path.relative(this.contentDir, guionM4aPath);
          } else if (fs.existsSync(guionMp3Path)) {
            console.log(`DEBUG: Found Guion MP3 for ${file.name}`);
            relativeAudioPath = path.relative(this.contentDir, guionMp3Path);
          } else if (fs.existsSync(guionWavPath)) {
            console.log(`DEBUG: Found Guion WAV for ${file.name}`);
            relativeAudioPath = path.relative(this.contentDir, guionWavPath);
          } else if (fs.existsSync(simpleWavPath)) {
            console.log(`DEBUG: Found Simple WAV for ${file.name}`);
            relativeAudioPath = path.relative(this.contentDir, simpleWavPath);
          } else if (fs.existsSync(simpleMp3Path)) {
            console.log(`DEBUG: Found Simple MP3 for ${file.name}`);
            relativeAudioPath = path.relative(this.contentDir, simpleMp3Path);
          } else {
            console.log(`DEBUG: NO Audio found for ${file.name}`);
          }

          // Check for associated evaluation file
          // Try multiple patterns
          let evalName = file.name.replace(".md", "_evaluacion.md"); // default: topic.md -> topic_evaluacion.md
          let foundEval = false;

          // Check default pattern first
          if (fs.existsSync(path.join(modulePath, evalName))) {
            foundEval = true;
          }

          // If not found and file ends in _contenido.md, try replacing that suffix
          if (!foundEval && file.name.endsWith("_contenido.md")) {
            const altName = file.name.replace(
              "_contenido.md",
              "_evaluacion.md"
            );
            if (fs.existsSync(path.join(modulePath, altName))) {
              evalName = altName;
              foundEval = true;
            }
          }

          // Check for Parent Topic Evaluation (e.g. tema_1.1_subtema_X -> tema_1.1_evaluacion)
          if (!foundEval && file.name.includes("_subtema_")) {
            const parentEvalName =
              file.name.split("_subtema_")[0] + "_evaluacion.md";
            if (fs.existsSync(path.join(modulePath, parentEvalName))) {
              evalName = parentEvalName;
              foundEval = true;
            }
          }

          // If still not found, check if the file ITSELF is an evaluation (edge case where evaluation is listed as a topic)
          // But we usually want to link it to the content.
          // If 'file' is '..._evaluacion.md', we don't need to look for another evaluation.
          if (file.name.endsWith("_evaluacion.md")) {
            // This file IS an evaluation. Ideally it shouldn't be a primary topic if it's auxiliary.
            // But if it IS scanned as a topic, it's its own content.
            evalName = null;
          } else if (!foundEval) {
            evalName = null;
          }

          let evalPath = null;
          let relativeEvalPath = null;

          if (evalName) {
            evalPath = path.join(modulePath, evalName);
            if (fs.existsSync(evalPath)) {
              relativeEvalPath = path.relative(this.contentDir, evalPath);
            }
          }

          // Get title from file
          const title = await this.getTopicTitle(filePath, file.name);

          const topicData = {
            id: topicId,
            module_id: moduleId,
            title: title,
            file_path: path.relative(this.contentDir, filePath),
            audio_path: relativeAudioPath,
            evaluation_path: relativeEvalPath,
            order_index: orderIndex++,
            estimated_minutes: 0, // TODO: Calculate from content length
          };

          console.log(`DEBUG: Upserting topic ${topicData.id}`);
          fs.appendFileSync("debug_scan.log", `Upserting: ${topicData.id}\n`);

          await dbService.upsertTopic(topicData);

          console.log(`DEBUG: Success topic ${topicData.id}`);
          fs.appendFileSync("debug_scan.log", `Success: ${topicData.id}\n`);
        } catch (topicError) {
          console.error(`FAILED to process file ${file.name}:`, topicError);
          fs.appendFileSync(
            "debug_scan.log",
            `ERROR processing ${file.name}: ${topicError.message}\n`
          );
        }
      }

      // Also check subdirectories (Actividades, Material, Evaluaciones)
      const subdirs = ["Actividades", "Material", "Evaluaciones"];
      for (const subdir of subdirs) {
        const subdirPath = path.join(modulePath, subdir);
        if (fs.existsSync(subdirPath)) {
          await this.parseSubdirectoryTopics(moduleId, subdirPath, orderIndex);
        }
      }
    } catch (error) {
      logger.error(`Error parsing topics for ${moduleId}:`, error);
    }
  }

  /**
   * Parse topics from subdirectories
   */
  async parseSubdirectoryTopics(moduleId, subdirPath, startIndex) {
    const files = fs
      .readdirSync(subdirPath, { withFileTypes: true })
      .filter((entry) => entry.isFile() && entry.name.endsWith(".md"));

    let orderIndex = startIndex;

    for (const file of files) {
      const topicId = `${moduleId}/${path.basename(
        subdirPath
      )}/${file.name.replace(".md", "")}`;
      const filePath = path.join(subdirPath, file.name);
      const title = await this.getTopicTitle(filePath, file.name);

      const topicData = {
        id: topicId,
        module_id: moduleId,
        title: `${path.basename(subdirPath)}: ${title}`,
        file_path: path.relative(this.contentDir, filePath),
        audio_path: null,
        order_index: orderIndex++,
        estimated_minutes: 0,
      };

      await dbService.upsertTopic(topicData);
    }
  }

  /**
   * Get topic title from markdown file
   */
  async getTopicTitle(filePath, fallbackName) {
    // User explicitly requested to use filename
    // Remove .md extension
    let name = fallbackName.replace(/\.md$/i, "");

    let prefix = "";
    if (name.match(/(__|_)ejercicios$/i)) {
      prefix = "📝 "; // Exercise icon
    }

    // Remove common suffixes to make it cleaner but still distinct
    name = name.replace(/(__|_)(contenido|evaluacion|ejercicios|guion)$/i, "");

    // Replace separators with spaces
    name = name.replace(/_+/g, " ");

    // Capitalize first letter
    return prefix + name.charAt(0).toUpperCase() + name.slice(1);
  }

  /**
   * Get all courses from database
   */
  async getAllCourses() {
    return await dbService.getAllCourses();
  }

  /**
   * Get topic by ID
   */
  async getTopicById(topicId) {
    return await dbService.getTopicById(topicId);
  }

  /**
   * Get course structure (modules and topics)
   */
  async getCourseStructure(courseId) {
    const course = await dbService.getCourseById(courseId);
    if (!course) {
      return null;
    }

    const modules = await dbService.getModulesByCourse(courseId);

    // Get topics for each module
    const modulesWithTopics = await Promise.all(
      modules.map(async (module) => ({
        ...module,
        topics: await dbService.getTopicsByModule(module.id),
      }))
    );

    return {
      ...course,
      modules: modulesWithTopics,
    };
  }

  /**
   * Get topic content
   */
  async getTopicContent(topicId) {
    const topic = await dbService.getTopicById(topicId);
    if (!topic) {
      return null;
    }

    const contentPath = path.join(this.contentDir, topic.file_path);

    if (!fs.existsSync(contentPath)) {
      logger.error(`Content file not found: ${contentPath}`);
      return null;
    }

    const content = fs.readFileSync(contentPath, "utf-8");

    return {
      ...topic,
      content: content,
    };
  }

  /**
   * Get audio file path
   */
  async getAudioPath(topicId) {
    const topic = await dbService.getTopicById(topicId);
    if (!topic || !topic.audio_path) {
      return null;
    }

    return path.join(this.contentDir, topic.audio_path);
  }

  /**
   * Get evaluation content path
   */
  async getEvaluationPath(topicId) {
    const topic = await dbService.getTopicById(topicId);
    if (!topic || !topic.evaluation_path) {
      return null;
    }

    return path.join(this.contentDir, topic.evaluation_path);
  }

  /**
   * Get evaluation content
   */
  async getEvaluationContent(topicId) {
    const topic = await dbService.getTopicById(topicId);
    if (!topic || !topic.evaluation_path) {
      return null;
    }

    const evalPath = path.join(this.contentDir, topic.evaluation_path);

    if (!fs.existsSync(evalPath)) {
      logger.warn(`Evaluation file not found: ${evalPath}`);
      return null;
    }

    return fs.readFileSync(evalPath, "utf-8");
  }
}

module.exports = new CourseService();
