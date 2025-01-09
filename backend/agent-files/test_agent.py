from rag_agent import get_rag_agent

# Initialize the agent
agent = get_rag_agent()

# Test question
test_input = {
    "input": "Can you explain what a pointer is in C programming?"
}

# Get response
response = agent.invoke(test_input)
print("Agent Response:")
print(response) 