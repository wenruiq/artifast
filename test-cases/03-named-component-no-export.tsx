import { useState } from "react";
import { Search, X } from "lucide-react";

function ContactList() {
  const [search, setSearch] = useState("");

  const contacts = [
    { name: "Alice Johnson", email: "alice@example.com", role: "Engineer" },
    { name: "Bob Smith", email: "bob@example.com", role: "Designer" },
    { name: "Carol White", email: "carol@example.com", role: "PM" },
    { name: "Dan Brown", email: "dan@example.com", role: "Engineer" },
    { name: "Eve Davis", email: "eve@example.com", role: "QA" },
  ];

  const filtered = contacts.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Team Directory</h1>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or role..."
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
        </div>
        <div className="space-y-2">
          {filtered.map((c) => (
            <div
              key={c.email}
              className="flex items-center gap-4 p-3 bg-white rounded-lg border border-gray-100 shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                {c.name[0]}
              </div>
              <div>
                <div className="font-medium text-gray-900">{c.name}</div>
                <div className="text-sm text-gray-500">{c.role}</div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-8">No contacts found</p>
          )}
        </div>
      </div>
    </div>
  );
}
