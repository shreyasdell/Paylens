#!/usr/bin/env python3
"""
Script to index runbooks in ChromaDB
"""
import sys
import os

# Add the parent directory to the path so we can import from app
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.chromadb_service import chromadb_service


def index_runbooks():
    """Index runbooks in ChromaDB"""
    print("Indexing runbooks in ChromaDB...")
    
    try:
        # Create collection
        chromadb_service.create_collection("runbooks")
        
        # Index runbooks from the data directory
        runbooks_dir = "../data/runbooks"
        chromadb_service.index_runbooks(runbooks_dir)
        
        print("✅ Runbooks indexed successfully")
        
        # Test search
        print("\nTesting runbook search...")
        test_query = "payment timeout issuer"
        results = chromadb_service.search_runbooks(test_query, n_results=2)
        
        print(f"Search query: '{test_query}'")
        print(f"Found {len(results)} results:")
        for i, result in enumerate(results, 1):
            print(f"{i}. {result.get('metadata', {}).get('title', 'Unknown')} (relevance: {result.get('relevance_score', 0):.2f})")
        
    except Exception as e:
        print(f"❌ Error indexing runbooks: {e}")
        raise


if __name__ == "__main__":
    index_runbooks()