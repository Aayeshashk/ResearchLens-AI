from app.db import Base
from app.models import User, Document, DocumentChunk, Chat, Message


print("Models loaded successfully!")
print("\nTables:")

for table in Base.metadata.tables.values():
    print(f"- {table.name}")

print("\nForeign keys:")

for table in Base.metadata.tables.values():
    for column in table.columns:
        for foreign_key in column.foreign_keys:
            print(
                f"- {table.name}.{column.name} "
                f"-> {foreign_key.target_fullname}"
            )

print("\nAll model relationships are registered successfully!")