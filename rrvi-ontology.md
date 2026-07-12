# RRVI™ Ontology

## Remote Regulatory Verification Infrastructure™

Version: 1.0.2

State: 00001H


# Purpose

The RRVI™ ontology defines the semantic structure of the EU AI Act Compliance Management System™.

It describes:

- entities;
- concepts;
- relationships;
- cardinalities;
- traceability rules.

The ontology enables humans and AI systems to understand how compliance information is structured.


# Core Concept

RRVI™ transforms regulatory obligations into a structured operational model.


The transformation:


Regulation

↓

Legal Obligations

↓

Compliance Modules

↓

Controls

↓

Controlled Documents

↓

Evidence

↓

Verification



# Ontology Entities


## Organization

Definition:

A legal entity responsible for operating AI systems and implementing compliance activities.


Relationships:

Organization operates RRVI System.

Organization operates AI Systems.



## RRVI System

Definition:

A compliance infrastructure used to organize AI governance obligations, controls, documents and evidence.


Relationship:

RRVI System contains Modules.



## Module

Definition:

A compliance domain representing an EU AI Act governance area.


Examples:

- AI System Inventory
- Risk Classification
- AI Literacy
- Prohibited Practices
- High-Risk AI Systems
- Technical Documentation
- Human Oversight
- Data Governance
- Logging and Monitoring
- Incident Reporting


Relationship:

Module contains Documents.



## Document

Definition:

A controlled compliance artifact uniquely identified, versioned and managed.


Document Types:

- Policy
- Procedure
- Work Instruction
- Checklist
- Register
- Evidence
- Declaration


Relationship:

Document belongs to Module.

Document is supported by Evidence.



## Evidence

Definition:

Objective information demonstrating that a compliance activity has been performed.


Examples:

- records
- approvals
- logs
- reports
- timestamps
- SHA-256 hashes


Relationship:

Evidence supports Document.



## AI System

Definition:

A machine-based system capable of generating outputs such as predictions, recommendations, decisions or content.


Relationships:

AI System implements AI Use Cases.

AI System is controlled by Human Oversight.

AI System may generate Incidents.



## AI Use Case

Definition:

A business scenario where an AI System is applied.


Relationship:

AI Use Case is classified by Risk Category.



## Risk Category

Definition:

Classification describing the applicable AI Act risk level.


Values:

- prohibited
- high-risk
- limited
- minimal



## Human Oversight

Definition:

Governance controls ensuring appropriate human supervision of AI System operation.



## Incident

Definition:

An event affecting AI system compliance, safety, availability, integrity or operation.


Relationship:

Incident originates from AI System.



## Regulation

Definition:

A legal framework mapped to compliance requirements.


Examples:

- Regulation (EU) 2024/1689 EU AI Act
- GDPR
- NIS2
- ISO 27001
- ISO 42001



# Relationship Model


Organization

↓

AI System

↓

AI Use Case

↓

Risk Category

↓

Compliance Module

↓

Document

↓

Evidence

↓

Verification



# Cardinality Rules


Organization:

1:1 RRVI System


RRVI System:

1:10 Modules


Module:

1:7 Documents


Document:

1:1 Document Type


Document:

1:n Evidence


AI System:

1:n AI Use Cases



# Traceability Rules


Every compliance statement must have supporting evidence.

Every document must belong to a module.

Every evidence object must reference a document.

Every AI System must have an owner.

Every AI Use Case must have a risk classification.

No orphan entities are allowed.



# RRVI Principles


## Traceability

Ability to follow relationships between requirements, controls, documents, records and evidence.


## Transparency

Compliance information must be understandable by humans and machines.


## Evidence-Based Compliance

Compliance claims require objective proof.


## Controlled Lifecycle

Documents are created, reviewed, approved, versioned and maintained.


## Bidirectional Relationships

Relationships support navigation in both directions.



# Prepared by

Dan Ionescu

AiVenture SRL


Version:

1.0.2
