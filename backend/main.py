from fastapi import FastAPI

app = FastAPI(title="Schedule Wizard API")


@app.get("/api/hello")
def hello() -> dict[str, str]:
    return {"message": "Hello from the FastAPI backend!"}
