"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPythonEnvironment = checkPythonEnvironment;
exports.getRagResponse = getRagResponse;
const child_process_1 = require("child_process");
const path_1 = __importDefault(require("path"));
// Function to check Python environment
async function checkPythonEnvironment() {
    return new Promise((resolve) => {
        const pythonProcess = (0, child_process_1.spawn)('python3', ['-c', 'import rag_agent, langchain_openai, langchain_chroma, dotenv'], {
            cwd: path_1.default.join(process.cwd(), 'agent-files')
        });
        pythonProcess.on('close', (code) => {
            resolve(code === 0);
        });
        pythonProcess.on('error', () => {
            resolve(false);
        });
    });
}
async function getRagResponse(message) {
    console.log("Getting RAG response...");
    // Use environment variables from .env file
    process.env["LANGCHAIN_TRACING_V2"] = process.env.LANGCHAIN_TRACING_V2;
    process.env["LANGCHAIN_PROJECT"] = process.env.LANGCHAIN_PROJECT;
    process.env["LANGCHAIN_ENDPOINT"] = process.env.LANGCHAIN_ENDPOINT;
    process.env["LANGCHAIN_API_KEY"] = process.env.LANGCHAIN_API_KEY;
    // Check Python environment before proceeding
    const isPythonReady = await checkPythonEnvironment();
    if (!isPythonReady) {
        return { output: '', error: 'Python environment is not properly configured' };
    }
    return new Promise((resolve, reject) => {
        // Create a temporary Python script
        const pythonScript = `
from rag_agent import get_rag_agent

agent = get_rag_agent()
response = agent.invoke({"input": """${message}"""})
print("RUNID_START" + str(agent._run_id_handler.run_id) + "RUNID_END")
print(response["output"])
`;
        const pythonProcess = (0, child_process_1.spawn)('python3', ['-c', pythonScript], {
            cwd: path_1.default.join(process.cwd(), 'agent-files')
        });
        let outputData = '';
        let errorData = '';
        let runId = '';
        pythonProcess.stdout.on('data', (data) => {
            const dataStr = data.toString();
            // Extract run ID if present
            const runIdMatch = dataStr.match(/RUNID_START(.+?)RUNID_END/);
            if (runIdMatch) {
                runId = runIdMatch[1];
                outputData += dataStr.replace(/RUNID_START(.+?)RUNID_END\n/, '');
            }
            else {
                outputData += dataStr;
            }
        });
        pythonProcess.stderr.on('data', (data) => {
            errorData += data.toString();
        });
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                resolve({ output: '', error: errorData });
            }
            else {
                resolve({ output: outputData.trim(), run_id: runId });
            }
        });
        pythonProcess.on('error', (error) => {
            resolve({ output: '', error: error.message });
        });
    });
}
//# sourceMappingURL=rag-service.js.map