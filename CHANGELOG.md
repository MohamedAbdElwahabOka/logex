# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Project initialized with MIT license

## Added

🔧 TypeScript + tsup build system with dual

- 🔍 Log line parser with 5 regex pattern formats
- 📦 Core type definitions (LogEntry, LogLevel, AnalysisResult, FilterOptions)
- 🧩 Level normalization (WARNING→WARN, EXCEPTION→ERROR)
- 📁 File system utilities (resolve paths, check existence, human-readable sizes)
- 🚀 Stream-parse entire log files with O(1) memory
- 📊 Line counting for accurate percentage calculations
- 📊 `analyze` command with level counts, percentages, severity breakdown
- 🧮 Single-pass analyzer (O(n)) with top message frequency tracking
- 🔧 Commander.js CLI framework with version and help
