# DEVELOPER GUIDE

## EU AI Act Compliance Management System™

Repository: RRVI™

Version: 1.0.2

---

# 1. Purpose

This guide describes how developers shall extend, maintain and version the EU AI Act Compliance Management System without compromising its engineering integrity, traceability or regulatory compliance.

---

# 2. Engineering Principles

Development shall follow these principles:

- Compliance by Design
- Documentation by Design
- Evidence by Design
- Traceability by Design
- Versioning by Design
- Inspection Readiness by Design

---

# 3. Repository Structure

Developers shall preserve the repository structure.

Do not rename:

- modules;
- controlled documents;
- document identifiers.

---

# 4. Document Naming

Controlled documents shall follow:

```
TYPE-NNN_Title.md
```

Examples:

```
DOD-001_AI_System_Inventory_Policy.md
PROC-001_AI_System_Inventory_Procedure.md
REG-005_High_Risk_Assessment_Register.md
```

---

# 5. Version Control

Every change shall:

- update Git history;
- update CHANGELOG;
- receive a version number;
- be included in the next GitHub Release.

---

# 6. Extending the Repository

New modules shall include exactly:

- Policy
- Procedure
- Work Instruction
- Checklist
- Register
- Evidence
- Declaration

---

# 7. Traceability

Maintain:

Policy

↓

Procedure

↓

Work Instruction

↓

Checklist

↓

Register

↓

Evidence

↓

Declaration

No document shall exist without traceability.

---

# 8. Quality Assurance

Before publishing verify:

- document consistency;
- internal references;
- version numbers;
- repository structure;
- Markdown rendering.

---

# 9. Release Process

For every release:

1. Update documentation.
2. Update CHANGELOG.
3. Commit changes.
4. Create Git tag.
5. Publish GitHub Release.
6. Verify Zenodo DOI.

---

# 10. Development Rules

Never:

- rename controlled IDs;
- remove traceability;
- break repository structure.

Always:

- preserve document relationships;
- maintain inspection readiness.

---

Version

1.0.2

Prepared by

Dan Ionescu

AiVenture SRL
