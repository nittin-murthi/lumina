import pytest
from unittest.mock import MagicMock
import os
from dotenv import load_dotenv

# Load environment variables for testing
load_dotenv()

@pytest.fixture
def mock_openai():
    """Fixture to mock OpenAI client."""
    mock = MagicMock()
    mock.chat.completions.create.return_value = MagicMock(
        choices=[
            MagicMock(
                message=MagicMock(
                    content="Test response",
                    role="assistant"
                )
            )
        ]
    )
    return mock

@pytest.fixture
def mock_chroma_client():
    """Fixture to mock ChromaDB client."""
    mock = MagicMock()
    mock.get_collection.return_value = MagicMock(
        query=MagicMock(return_value={
            'documents': ['Test document'],
            'metadatas': [{'source': 'test.txt'}],
            'distances': [0.5]
        })
    )
    return mock

@pytest.fixture
def test_environment():
    """Fixture to set up test environment variables."""
    original_env = dict(os.environ)
    os.environ.update({
        'OPENAI_API_KEY': 'test-key',
        'ENVIRONMENT': 'test'
    })
    yield
    os.environ.clear()
    os.environ.update(original_env) 