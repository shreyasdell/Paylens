"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "@/lib/api";
import { Runbook } from "@/types/api";
import { Skeleton } from "./ui/Skeleton";
import { Search, BookOpen, Clock } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function RunbooksList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRunbook, setSelectedRunbook] = useState<Runbook | null>(null);

  const { data: runbooks, isLoading, error } = useQuery({
    queryKey: ["runbooks"],
    queryFn: () => apiService.getRunbooks(),
  });

  const filteredRunbooks = runbooks?.data?.filter((runbook: Runbook) =>
    runbook.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    runbook.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="card">
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !runbooks || !runbooks.data) {
    return (
      <div className="card border-red-500/20">
        <p className="text-red-400 text-sm">Failed to load runbooks</p>
      </div>
    );
  }

  if (selectedRunbook) {
    return (
      <div className="card">
        <button
          onClick={() => setSelectedRunbook(null)}
          className="text-sm text-purple-400 hover:text-purple-300 mb-4"
        >
          ← Back to list
        </button>
        <div className="mb-4">
          <span className="text-xs text-gray-500 uppercase tracking-wide">
            {selectedRunbook.category}
          </span>
          <h2 className="text-2xl font-semibold text-white mt-1">
            {selectedRunbook.title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-400">
              Relevance: {(selectedRunbook.relevance_score * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        <div className="prose prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {selectedRunbook.content}
          </ReactMarkdown>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search runbooks by title or category..."
            className="input pl-10"
          />
        </div>
      </div>

      {/* Runbooks List */}
      {filteredRunbooks.length === 0 ? (
        <div className="card">
          <p className="text-gray-400 text-center py-8">
            No runbooks found matching "{searchQuery}"
          </p>
        </div>
      ) : (
        filteredRunbooks.map((runbook: Runbook) => (
          <div
            key={runbook.title}
            className="card hover:border-accent-purple/50 cursor-pointer transition-colors"
            onClick={() => setSelectedRunbook(runbook)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-4 w-4 text-purple-400" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    {runbook.category}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {runbook.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>Relevance: {(runbook.relevance_score * 100).toFixed(0)}%</span>
                </div>
              </div>
              <div className="text-purple-400">
                <BookOpen className="h-5 w-5" />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
