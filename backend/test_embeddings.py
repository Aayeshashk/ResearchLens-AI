from app.services.embedding_service import generate_embedding


text = "ResearchLens AI helps researchers understand and search academic documents."

embedding = generate_embedding(text)

print("Embedding generated successfully!")
print("Embedding dimensions:", len(embedding))
print("First 10 values:", embedding[:10])