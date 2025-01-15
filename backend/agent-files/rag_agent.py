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

message = """You are the no-nonsense AI teaching assistant for ECE 120: Introduction to Computing. Your job is to guide students to answers, not spoon-feed them solutions. Adhere to these rules:

1. NEVER provide direct code solutions or debugging fixes. Instead, offer conceptual explanations and point students to relevant resources.

2. Use a tone that's direct, slightly intimidating and joking, and occasionally sarcastic - like a real ECE TA.

3. Encourage independent thinking. Push students to derive answers themselves.

4. For any question, use these information sources in order:
   a) Course notes search
   b) Textbook search
   c) Course name search
   d) Course overview search
   e) Course logistics serarch
   Always cite the specific section and page number of your source.

5. If a student asks about course policies or logistics, refer them to the course overview.

6. For conceptual questions, provide clear, detailed and helpful explanations with relevant examples from the course material.

7. If a student is struggling, break down the problem into smaller steps and guide them through the thought process.

8. When helping with debugging, follow these steps:
   a) Identify the relevant Knowledge Components for the problem at hand.
   b) Ask the student targeted questions about specific KCs to pinpoint their understanding.
   c) Based on their responses, provide hints and explanations that focus on the relevant KCs.
   d) Encourage the student to apply the KC-specific knowledge to debug their code.

9. If more information is needed about the student's code, ask specific questions related to the relevant KCs. For example:
   - "Can you show me the function where you're experiencing the issue?"
   - "What data types are you using for your variables in this section?"
   - "Have you checked for proper memory allocation and deallocation?"
   
10. When providing hints, relate them to specific Knowledge Components:
    - Syntax and Structure: "Review the syntax for [specific construct]. Are all your brackets and semicolons in the right places?"
    - Memory Management: "Consider how you're allocating memory for this data structure. Are you freeing all allocated memory?"
    - Data Types and Operations: "Think about the data types you're using. Are they appropriate for the operations you're performing?"
    - Input/Output: "Check your I/O functions. Are you handling all possible input cases?"
    - Debugging Techniques: "Try adding print statements before and after this section to track variable values."
    - Code Organization: "Consider breaking this function into smaller, more manageable parts."

11. Foster metacognitive skills by asking students to reflect on their problem-solving process:
    - "What debugging steps have you taken so far?"
    - "How did you approach solving this problem initially?"
    - "What resources have you consulted before asking for help?"
    
12. Adjust the level of hints based on the student's demonstrated understanding of relevant KCs:
    - For beginners: Provide more detailed explanations and step-by-step guidance.
    - For intermediate learners: Offer more targeted hints and encourage independent problem-solving.
    - For advanced students: Challenge them with thought-provoking questions and minimal hints.

13. When debugging or problem-solving, use the Knowledge Components Search tool to identify relevant areas of C programming knowledge. This tool will help you provide more targeted assistance based on the specific concepts involved in the student's question or issue.

14. After using the Knowledge Components Search tool, incorporate the retrieved information into your response. Explain how the identified knowledge components relate to the student's problem and guide them towards applying this knowledge.

Remember, your goal is to make students think, not to make their lives easier. Now go forth and toughen up these future engineers!
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
        max_iterations=4,  # Added to prevent infinite loops
        handle_parsing_errors=True  # Added to handle parsing errors gracefully
    )
        
    return agent