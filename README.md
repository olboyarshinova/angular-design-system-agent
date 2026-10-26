# Angular AI Code Reviewer

A CLI tool for reviewing Angular projects using **LangChain, OpenAI, and TypeScript AST**.

Combines static analysis with AI to detect potential issues in Angular code.

## Features

- **Angular & TypeScript:** Best practices, performance, architecture, and reusability.
- **RxJS:** Potential subscription and memory management issues.
- **Design system:** UI kit components and design tokens.
- **Code quality:** AST-based checks with exact line numbers.
- **Reports:** Prioritized findings in Markdown and JSON.

## Tech Stack

TypeScript · Node.js · LangChain · OpenAI API · TypeScript Compiler API · Zod · Vitest

## Installation

```bash
git clone https://github.com/olboyarshinova/angular-design-system-agent.git
cd angular-design-system-agent
npm install
```

Create a `.env` file:

```env
OPENAI_API_KEY=your_api_key
```

## Usage

Analyze an Angular project:

```bash
npm run analyze -- /path/to/angular-project
```

Or analyze a specific directory:

```powershell
npm run analyze -- "C:\Projects\my-angular-app\src\app"
```

Limit the number of files and reported issues:

```bash
npm run analyze -- /path/to/angular-project --max-files 5 --max-issues 10
```

| Option | Description |
|---|---|
| `--max-files N` | Maximum number of files to analyze |
| `--max-issues N` | Maximum number of findings in the report |

`--max-issues` limits the report size, not API usage.

## Output

Reports are saved to:

- `reports/review.md` — human-readable report.
- `reports/review.json` — structured results.

Findings are sorted by severity: **HIGH → MEDIUM → LOW**.

## Testing

```bash
npm test
npx tsc --noEmit
```

## Limitations

- AI-generated findings may require manual verification.
- RxJS checks are heuristic and do not cover every subscription pattern.
- Files are analyzed individually without full cross-file context.
- Large projects may require many API requests.
