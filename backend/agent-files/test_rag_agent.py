import pytest
from unittest.mock import MagicMock, patch
import os
from langchain_core.documents import Document
from langchain_core.messages import AIMessage, HumanMessage
from rag_agent import get_rag_agent


class TestRAGAgent:
    @pytest.fixture
    def mock_chroma(self):
        with patch('langchain_chroma.Chroma') as mock:
            mock.return_value.as_retriever.return_value = MagicMock(
                get_relevant_documents=MagicMock(return_value=[
                    Document(page_content="Test content", metadata={"source": "test.txt"})
                ])
            )
            yield mock

    @pytest.fixture
    def mock_azure_chat(self):
        with patch('langchain_openai.AzureChatOpenAI') as mock:
            mock.return_value = MagicMock(
                predict_messages=MagicMock(return_value=AIMessage(content="Test response"))
            )
            yield mock

    def test_agent_initialization(self, mock_chroma, mock_azure_chat, test_environment):
        """Test that the RAG agent initializes correctly."""
        agent = get_rag_agent()
        assert agent is not None
        assert hasattr(agent, 'run')

    @pytest.mark.asyncio
    async def test_agent_query_response(self, mock_chroma, mock_azure_chat, test_environment):
        """Test that the agent responds appropriately to queries."""
        agent = get_rag_agent()
        response = await agent.ainvoke({"input": "What is the course about?"})
        assert isinstance(response, dict)
        assert "output" in response
        assert isinstance(response["output"], str)

    def test_agent_with_context(self, mock_chroma, mock_azure_chat, test_environment):
        """Test that the agent uses context from the vector store."""
        agent = get_rag_agent()
        mock_chroma.return_value.as_retriever.return_value.get_relevant_documents.assert_called_once()
        
    @pytest.mark.parametrize("query,expected_contains", [
        ("What is the course name?", "course"),
        ("Tell me about assignments", "assignment"),
        ("What are the prerequisites?", "prerequisite")
    ])
    def test_agent_different_queries(self, query, expected_contains, mock_chroma, mock_azure_chat, test_environment):
        """Test agent responses to different types of queries."""
        agent = get_rag_agent()
        mock_azure_chat.return_value.predict_messages.return_value = AIMessage(content=f"Response about {expected_contains}")
        response = agent.invoke({"input": query})
        assert expected_contains in response["output"].lower()

    def test_agent_error_handling(self, mock_chroma, mock_azure_chat, test_environment):
        """Test agent's error handling capabilities."""
        mock_chroma.side_effect = Exception("Test error")
        with pytest.raises(Exception) as exc_info:
            agent = get_rag_agent()
        assert "Test error" in str(exc_info.value) 