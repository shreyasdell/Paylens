"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

export function PaymentInvestigationSearch() {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      router.push(`/investigate/${searchValue.trim()}`);
    }
  };

  return (
    <div className="card mb-6">
      <form onSubmit={handleSearch} className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Enter payment ID (e.g., PAY_12345)"
            className="input pl-10"
          />
        </div>
        <button type="submit" className="btn-primary">
          Investigate
        </button>
      </form>
    </div>
  );
}
