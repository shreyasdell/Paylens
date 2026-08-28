import chromadb
from chromadb.config import Settings as ChromaSettings
from chromadb.utils import embedding_functions
from typing import List, Dict, Any, Optional
import logging
import os
from pathlib import Path
import markdown
from bs4 import BeautifulSoup
from app.core.config import settings

logger = logging.getLogger(__name__)


class ChromaDBService:
    """Service for ChromaDB operations and RAG"""
    
    def __init__(self):
        self.client = None
        self.collection = None
        self.embedding_function = None
        self._initialize_client()
    
    def _initialize_client(self):
        """Initialize ChromaDB client and embedding function"""
        try:
            # Create persist directory if it doesn't exist
            os.makedirs(settings.CHROMADB_PERSIST_DIRECTORY, exist_ok=True)
            
            # Initialize ChromaDB client
            self.client = chromadb.PersistentClient(
                path=settings.CHROMADB_PERSIST_DIRECTORY,
                settings=ChromaSettings(
                    anonymized_telemetry=False,
                    allow_reset=True
                )
            )
            
            # Initialize embedding function (using default sentence transformer)
            self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(
                model_name="all-MiniLM-L6-v2"
            )
            
            logger.info("ChromaDB client initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize ChromaDB client: {e}")
            raise
    
    def create_collection(self, collection_name: str = "runbooks"):
        """Create or get a collection"""
        try:
            # Delete existing collection if it exists
            try:
                self.client.delete_collection(collection_name)
                logger.info(f"Deleted existing collection: {collection_name}")
            except:
                pass
            
            # Create new collection
            self.collection = self.client.create_collection(
                name=collection_name,
                embedding_function=self.embedding_function,
                metadata={"hnsw:space": "cosine"}
            )
            
            logger.info(f"Created collection: {collection_name}")
            return self.collection
            
        except Exception as e:
            logger.error(f"Failed to create collection: {e}")
            raise
    
    def get_collection(self, collection_name: str = "runbooks"):
        """Get existing collection"""
        try:
            self.collection = self.client.get_collection(
                name=collection_name,
                embedding_function=self.embedding_function
            )
            logger.info(f"Retrieved collection: {collection_name}")
            return self.collection
        except Exception as e:
            logger.error(f"Failed to get collection: {e}")
            return None
    
    def parse_markdown_file(self, file_path: str) -> Dict[str, Any]:
        """Parse markdown file and extract content"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Extract title from first heading
            lines = content.split('\n')
            title = lines[0].replace('#', '').strip()
            
            # Convert markdown to HTML and extract text
            html = markdown.markdown(content)
            soup = BeautifulSoup(html, 'html.parser')
            text_content = soup.get_text(separator=' ', strip=True)
            
            # Extract category from filename
            filename = Path(file_path).stem
            category = filename.replace('_', ' ').title()
            
            return {
                "title": title,
                "content": text_content,
                "original_content": content,
                "category": category,
                "filename": filename
            }
            
        except Exception as e:
            logger.error(f"Failed to parse markdown file {file_path}: {e}")
            return {}
    
    def index_runbooks(self, runbooks_dir: str):
        """Index all runbook markdown files"""
        try:
            runbooks_path = Path(runbooks_dir)
            if not runbooks_path.exists():
                logger.error(f"Runbooks directory not found: {runbooks_dir}")
                return
            
            markdown_files = list(runbooks_path.glob("*.md"))
            logger.info(f"Found {len(markdown_files)} runbook files")
            
            documents = []
            metadatas = []
            ids = []
            
            for idx, file_path in enumerate(markdown_files):
                parsed = self.parse_markdown_file(str(file_path))
                if not parsed:
                    continue
                
                documents.append(parsed["content"])
                metadatas.append({
                    "title": parsed["title"],
                    "category": parsed["category"],
                    "filename": parsed["filename"]
                })
                ids.append(f"runbook_{idx}")
                
                logger.info(f"Parsed: {parsed['title']}")
            
            if documents:
                # Add documents to collection
                self.collection.add(
                    documents=documents,
                    metadatas=metadatas,
                    ids=ids
                )
                
                logger.info(f"Indexed {len(documents)} runbooks successfully")
            else:
                logger.warning("No runbooks to index")
                
        except Exception as e:
            logger.error(f"Failed to index runbooks: {e}")
            raise
    
    def search_runbooks(self, query: str, n_results: int = 3) -> List[Dict[str, Any]]:
        """Search for relevant runbooks"""
        try:
            if not self.collection:
                logger.error("Collection not initialized")
                return []
            
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results
            )
            
            formatted_results = []
            if results['documents'] and results['documents'][0]:
                for idx, doc in enumerate(results['documents'][0]):
                    formatted_results.append({
                        "content": doc,
                        "metadata": results['metadatas'][0][idx] if results['metadatas'] else {},
                        "distance": results['distances'][0][idx] if results['distances'] else 0,
                        "relevance_score": 1 - results['distances'][0][idx] if results['distances'] else 1
                    })
            
            logger.info(f"Found {len(formatted_results)} relevant runbooks for query: {query}")
            return formatted_results
            
        except Exception as e:
            logger.error(f"Failed to search runbooks: {e}")
            return []
    
    def get_all_runbooks(self) -> List[Dict[str, Any]]:
        """Get all indexed runbooks"""
        try:
            if not self.collection:
                logger.error("Collection not initialized")
                return []
            
            results = self.collection.get()
            
            formatted_results = []
            if results['documents']:
                for idx, doc in enumerate(results['documents']):
                    formatted_results.append({
                        "content": doc,
                        "metadata": results['metadatas'][idx] if results['metadatas'] else {},
                        "id": results['ids'][idx] if results['ids'] else ""
                    })
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Failed to get all runbooks: {e}")
            return []


# Singleton instance
chromadb_service = ChromaDBService()