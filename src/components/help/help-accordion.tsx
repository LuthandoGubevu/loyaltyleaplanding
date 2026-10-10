"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import type { Section } from "@/content/help/admin";

interface HelpAccordionProps {
  sections: Section[];
  anchor?: string;
}

function renderContent(text: string): React.ReactNode[] {
  return text.split("\n\n").map((para, i) => {
    // Markdown-style table (contains |)
    if (para.includes("|") && para.split("\n").length > 1) {
      const rows = para.trim().split("\n").filter((r) => !r.match(/^\|[-| ]+\|$/));
      if (rows.length > 0) {
        return (
          <div key={i} className="overflow-x-auto my-3">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {rows.map((row, ri) => {
                  const cells = row.split("|").filter((_, ci) => ci > 0 && ci < row.split("|").length - 1);
                  const Tag = ri === 0 ? "th" : "td";
                  return (
                    <tr key={ri} className={ri === 0 ? "border-b font-medium" : "border-b last:border-0"}>
                      {cells.map((cell, ci) => (
                        <Tag key={ci} className="px-2 py-1 text-left">{cell.trim()}</Tag>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Ordered list
    if (/^\d+\.\s/.test(para.trim())) {
      const items = para.trim().split("\n").filter(Boolean);
      return (
        <ol key={i} className="list-decimal pl-5 space-y-1 my-2 text-sm text-muted-foreground">
          {items.map((item, ii) => (
            <li key={ii} dangerouslySetInnerHTML={{ __html: inlineFormat(item.replace(/^\d+\.\s/, "")) }} />
          ))}
        </ol>
      );
    }

    // Unordered list
    if (para.trim().startsWith("- ")) {
      const items = para.trim().split("\n").filter(Boolean);
      return (
        <ul key={i} className="list-disc pl-5 space-y-1 my-2 text-sm text-muted-foreground">
          {items.map((item, ii) => (
            <li key={ii} dangerouslySetInnerHTML={{ __html: inlineFormat(item.replace(/^- /, "")) }} />
          ))}
        </ul>
      );
    }

    // Bold heading (starts with **)
    if (para.trim().startsWith("**") && para.trim().endsWith("**")) {
      return (
        <p key={i} className="font-semibold mt-4 mb-1 text-sm">
          {para.trim().slice(2, -2)}
        </p>
      );
    }

    // Regular paragraph
    return (
      <p key={i} className="text-sm text-muted-foreground leading-relaxed" dangerouslySetInnerHTML={{ __html: inlineFormat(para) }} />
    );
  });
}

function inlineFormat(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline-offset-4 hover:underline">$1</a>');
}

export function HelpAccordion({ sections, anchor }: HelpAccordionProps) {
  const [query, setQuery] = useState("");
  const [openItems, setOpenItems] = useState<string[]>([]);

  // Open the anchored section on mount
  useEffect(() => {
    if (anchor) setOpenItems([anchor]);
  }, [anchor]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(
      (s) => s.title.toLowerCase().includes(q) || s.content.toLowerCase().includes(q)
    );
  }, [sections, query]);

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search the guide…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search help"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-6 text-center">No sections match "{query}".</p>
      ) : (
        <Accordion
          type="multiple"
          value={openItems}
          onValueChange={setOpenItems}
          className="w-full"
        >
          {filtered.map((section) => (
            <AccordionItem key={section.id} value={section.id} id={section.id}>
              <AccordionTrigger className="text-left font-medium">{section.title}</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pb-2">{renderContent(section.content)}</div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
