"""Test bootstrap: main.py reads its environment at import time, so the
required variables (and an isolated SQLite path) must be set before any
test imports it."""

import os
import sys
import tempfile

os.environ["ANTHROPIC_API_KEY"] = "test-key"
os.environ["ACCESS_CODE"] = "test-code"
os.environ["DB_PATH"] = os.path.join(tempfile.mkdtemp(prefix="retail-pulse-test-"), "articles.db")

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import pytest
from fastapi.testclient import TestClient

import main


@pytest.fixture(autouse=True)
def fresh_db():
    """Recreate empty tables for every test."""
    main.init_db()
    import sqlite3

    with sqlite3.connect(main.DB_PATH) as conn:
        conn.execute("DELETE FROM articles")
        conn.execute("DELETE FROM preferences")
        conn.commit()
    yield


@pytest.fixture
def client():
    # Plain TestClient (no context manager) skips the lifespan hook, so the
    # RSS scheduler never starts during tests.
    return TestClient(main.app)
