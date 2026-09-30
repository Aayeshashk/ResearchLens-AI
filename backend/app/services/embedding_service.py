from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"

model = None


def get_model():
    global model

    if model is None:
        model = SentenceTransformer(MODEL_NAME)

    return model


def generate_embedding(text: str) -> list[float]:
    embedding = get_model().encode(
        text,
        normalize_embeddings=True,
    )

    return embedding.tolist()