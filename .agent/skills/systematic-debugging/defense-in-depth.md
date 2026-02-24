# Defense-in-Depth Validation

## Overview
Validate at EVERY layer data passes through. Make the bug structurally impossible.

## The Four Layers

### Layer 1: Entry Point Validation
Reject obviously invalid input at the API boundary.

### Layer 2: Business Logic Validation
Ensure data makes sense for this specific operation.

### Layer 3: Environment Guards
Prevent dangerous operations in specific contexts (e.g., refusing `git init` outside temp directories in tests).

### Layer 4: Debug Instrumentation
Capture context (like stack traces) to help with forensics if layers 1-3 are bypassed.

## Key Insight
Don't stop at one validation point. Add checks at every layer to catch bugs missed by others.
