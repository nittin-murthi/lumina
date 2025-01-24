import os
from typing import List, Dict, Any
from dotenv import load_dotenv

# LangChain imports
from langchain_openai import AzureChatOpenAI, AzureOpenAIEmbeddings
from langchain_chroma import Chroma
from langchain.agents.agent_toolkits import create_retriever_tool, create_conversational_retrieval_agent
from langchain.schema.messages import SystemMessage
from langchain.memory import ConversationBufferMemory
from langchain.tools import Tool, BaseTool
from langchain.callbacks import StdOutCallbackHandler
from langchain_core.callbacks import BaseCallbackHandler
from langchain_core.language_models import BaseLanguageModel
from langchain_community.utilities import StackExchangeAPIWrapper

# Load environment variables
load_dotenv()

# Azure OpenAI Configuration
API_KEY = os.getenv("OPENAI_API_KEY")
ENDPOINT = os.getenv("OPENAI_ENDPOINT")
API_VERSION = os.getenv("OPENAI_API_VERSION")
DEPLOYMENT_NAME = os.getenv("AZURE_DEPLOYMENT_NAME")

os.environ["AZURE_OPENAI_ENDPOINT"] = ENDPOINT
os.environ["AZURE_OPENAI_API_KEY"] = API_KEY
os.environ["AZURE_OPENAI_API_VERSION"] = API_VERSION
os.environ["AZURE_OPENAI_DEPLOYMENT_NAME"] = DEPLOYMENT_NAME

# Initialize embedding model with improved parameters
embedding = AzureOpenAIEmbeddings(
    model="text-embedding-3-large",
    dimensions=1536,
    chunk_size=512,
)

# Initialize vector stores with consistent retrieval parameters
retriever_kwargs = {
    "search_type": "similarity",
    "k": 4,  # Increased from default to get more context
    "score_threshold": 0.7,  # Added relevance threshold
    "fetch_k": 20  # Fetch more candidates for reranking
}


# Initialize Chroma databases with consistent parameters
db_course_name = Chroma(persist_directory="chroma_db_course_name", embedding_function=embedding)
retriever_course_name = db_course_name.as_retriever(**retriever_kwargs)

db_course_overview = Chroma(persist_directory="chroma_db_course_overview", embedding_function=embedding)
retriever_course_overview = db_course_overview.as_retriever(**retriever_kwargs)

db_course_notes = Chroma(persist_directory="chroma_db_notes", embedding_function=embedding)
retriever_course_notes = db_course_notes.as_retriever(**retriever_kwargs)

db_course_textbook = Chroma(persist_directory="chroma_db_textbook", embedding_function=embedding)
retriever_course_textbook = db_course_textbook.as_retriever(**retriever_kwargs)

db_kc = Chroma(persist_directory="chroma_db_kc", embedding_function=embedding)
retriever_kc = db_kc.as_retriever(**retriever_kwargs)

db_course_logistics = Chroma(persist_directory="course-logistics-retriever", embedding_function=embedding)
retriever_course_logistics = db_course_logistics.as_retriever(**retriever_kwargs)

# def create_flowchart(description: str) -> str:
#     """Create a flowchart based on the given description using pyflowchart."""
#     lines = description.split('\n')
#     nodes = []
#     for i, line in enumerate(lines):
#         if i == 0:
#             nodes.append(f'st=>start: {line.strip()}')
#         elif i == len(lines) - 1:
#             nodes.append(f'e=>end: {line.strip()}')
#         else:
#             nodes.append(f'op{i}=>operation: {line.strip()}')
    
#     connections = []
#     for i in range(len(nodes) - 1):
#         if i == 0:
#             connections.append(f'st->op1')
#         elif i == len(nodes) - 2:
#             connections.append(f'op{i}->e')
#         else:
#             connections.append(f'op{i}->op{i+1}')

#     flowchart_code = '\n'.join(nodes + connections)

#     with tempfile.NamedTemporaryFile(mode='w', delete=False, suffix='.txt') as tmp_file:
#         tmp_file.write(flowchart_code)
#         return tmp_file.name

# def flowchart_tool(description: str) -> str:
#     """Tool function to create and return the path to a flowchart file."""
#     flowchart_path = create_flowchart(description)
#     return f"Flowchart created and saved at: {flowchart_path}"

# Initialize tools
#stackexchange = StackExchangeAPIWrapper(max_results=3, result_separator='||')

tools = [
    create_retriever_tool(
        retriever_course_notes,
        "search_course_notes",
        "Primary tool for course-specific content and concepts. Search course notes first.",
    ),
    create_retriever_tool(
        retriever_course_textbook,
        "search_course_textbook",
        "Primary tool for C programming questions. Search textbook content.",
    ),
    create_retriever_tool(
        retriever_kc,
        "search_knowledge_components",
        "Search Knowledge Components (KCs) for C programming concepts and debugging.",
    ),
    create_retriever_tool(
        retriever_course_logistics,
        "search_course_logistics",
        "Search course logistics, schedules, and policies from Canvas.",
    ),
    create_retriever_tool(
        retriever_course_overview,
        "search_course_overview",
        "Search course overview and policies.",
    ),
    create_retriever_tool(
        retriever_course_name,
        "search_course_name",
        "Basic course name information.",
    ),
    # Tool(
    #     name="search_stackexchange",
    #     func=stackexchange.run,
    #     description="Search StackExchange for programming questions and best practices."
    # ),
    # Tool(
    #     name="create_flowchart",
    #     func=flowchart_tool,
    #     description="Create a flowchart from step-by-step program logic description."
    # ),
]

message = """
You are the approachable yet firm AI teaching assistant for ECE 120: Introduction to Computing. Your job is to guide students to find answers themselves while building their problem-solving skills. Keep these principles in mind:

1. **Promote Independent Thinking:** Avoid giving direct code solutions or debugging fixes. Instead, offer clear, conceptual explanations and point students to relevant course resources.

2. **Adopt a Constructive and Supportive Tone:** Be direct but empathetic. Use light humor to keep interactions engaging, but avoid sarcasm or snark that might discourage students.

3. **Connect Explanations to Examples:** When providing examples, explain their relevance and show how they apply to the problem at hand. Help students see the connection between concepts and practical use.

4. **Encourage Reflection:** Foster critical thinking by asking students to reflect on their approach:
   - "What steps have you already taken to solve this?"
   - "What specific aspect of the problem is giving you trouble?"
   - "Which course materials or examples can you refer to for guidance?"

5. **Tailor Support to Skill Levels:**
   - Beginners: Break down concepts step-by-step, offering detailed guidance.
   - Intermediate learners: Provide targeted hints and encourage exploration.
   - Advanced students: Pose thought-provoking questions to challenge their understanding.

6. **Debugging Process:** Help students debug by breaking problems into smaller steps:
   - Identify relevant **Knowledge Components (KCs)** (e.g., syntax, memory management).
   - Ask targeted questions to assess understanding (e.g., "What is the expected output for this code section?").
   - Provide hints that focus on the relevant KCs and encourage students to apply them.

7. **Knowledge Sources:** Base your responses on these sources (in order):
   - Course notes
   - Textbook sections
   - Course overview
   - Relevant course logistics
   Always cite specific sections and page numbers to guide students to the right materials.

8. **Example Integration:** Tie examples directly to the concepts. For instance, when explaining a `for` loop, include:
   - An explanation of its structure (initialization, condition, update).
   - A relevant example (e.g., iterating through an array).
   - A connection to the concept, such as "Notice how the loop's condition ensures we visit every element in the array."

9. **Encourage Persistence:** Acknowledge effort and remind students that learning involves struggle:
   - "You've made a great start by identifying this issue."
   - "What’s one small step you can take to tackle this problem?"

10. **Use the Knowledge Components Search Tool:** Leverage this tool to identify the most relevant C programming concepts. Use the retrieved information to guide students in applying those concepts effectively.

Your goal is to empower students to think critically and solve problems independently while feeling supported. Build their confidence in tackling challenges, one step at a time!
"""

system_message = SystemMessage(content=message)
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

llm = AzureChatOpenAI(
    azure_deployment="gpt4-o",
    api_version="2024-02-15-preview",
    model_name="gpt-4",
    temperature=0.7,
    max_tokens=None,
    timeout=None,
    max_retries=3,
)

def get_rag_agent():
    class RunIDCallbackHandler(BaseCallbackHandler):
        def __init__(self):
            self.run_id = None

        def on_chain_start(self, serialized: Dict[str, Any], inputs: Dict[str, Any], **kwargs: Any) -> None:
            self.run_id = kwargs.get("run_id")
            print(f"Run ID: {self.run_id}")
            
    stdout_handler = StdOutCallbackHandler()
    run_id_handler = RunIDCallbackHandler()
    
    agent = create_conversational_retrieval_agent(
        llm,
        tools,
        system_message=system_message,
        remember_intermediate_steps=True,
        verbose=False,
        memory_key='chat_history',
        callback_manager=[stdout_handler, run_id_handler],
        max_iterations=4,
        handle_parsing_errors=True
    )
    
    # Add the run ID handler as an attribute to access it later
    agent._run_id_handler = run_id_handler
        
    return agent