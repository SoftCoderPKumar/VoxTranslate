const { validationResult } = require("express-validator");
const { getSession, generateGroqOrOpenaiInstance, questionAnswerWithGroqOrOpenai, updateDifficulty } = require("../utils/util");

const exportData = {};

exportData.talkAboutAnything = async (req, res, next) => {
    try {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: 'Validation failed', errors: errors.array() });
        }

        const { topic, question, studentAnswer, provider, difficultyLevel } = req.body;
        const userId = req.user._id;


        const session = await getSession(userId);
        if (topic) {
            session.topic = topic;
        }


        // 1. Initialize the generative AI model
        // const ai = await generativeAiInstance();
        const ai = await generateGroqOrOpenaiInstance(provider, userId);
        // 2. Generate the final response using the context and the original question
        const content = await questionAnswerWithGroqOrOpenai(question, studentAnswer, session, ai, provider, userId);

        let jsonResponse;
        try {
            jsonResponse = JSON.parse(content);
        } catch (err) {
            return res.status(500).json({
                error: "Invalid JSON from LLM",
                raw: content
            });
        }
        if (jsonResponse.difficulty_level) {
            updateDifficulty(userId, difficultyLevel);
        }
        res.status(200).json({ status: true, message: 'Response generated successfully.', res: jsonResponse });
    } catch (error) {
        next(error)
    }

}
module.exports = exportData;