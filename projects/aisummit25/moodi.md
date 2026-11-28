---
event: aisummit25
title: Moodi
publishedDate: '2025-10-12'
description: your mood come alive
thumbnailUrl: ''
category: Technology
status: published
contentFormat: markdown
tags:
  - Linkup
  - Veed.io
  - SLNG//
  - Lingo.dev
  - Runware
  - Elevenlabs
  - Hookdeck
  - n8n
techStack:
  - "# Comprehensive Project Documentation: Moodi App & n8n Workflow Integration\n\n## Project Overview\n\nThis project consists of two interconnected systems:\n1. **Moodi iOS/macOS App** - A SwiftUI-based mood tracking and reflection application\n2. **n8n Cloud Workflows** - Three automated workflows for content generation and processing\n\n## \U0001F34E Moodi iOS/macOS Application\n\n### Architecture & Tech Stack\n\n**Core Framework**: SwiftUI with **The Composable Architecture (TCA)** by Point-Free\n- **Language**: Swift 6.2+\n- **Platforms**: iOS 17+"
  - |-
    macOS 15+
    - **Architecture Pattern**: Unidirectional data flow with reducer-based state management

    ### Point-Free Ecosystem Dependencies

    1. **swift-composable-architecture** (v1.22.3)
       - Primary state management framework
       - Reducer-based architecture with side effect management
       - Time-travel debugging capabilities

    2. **swift-dependencies** (v1.10.0)
       - Dependency injection framework
       - `@DependencyClient` macro for protocol-based testing
       - Mock implementations for unit testing

    3. **swift-tagged** (v0.10.0)
       - Type-safe identifiers and wrapper types
       - Prevents ID mixing across different entity types

    4. **swift-identified-collections** (v1.1.1)
       - Collections indexed by identifiable elements
       - Efficient lookups
  - updates
  - |-
    and diffing by ID

    5. **swift-concurrency-extras** (v1.3.2)
       - Swift concurrency utilities and extensions

    ### Project Structure

    ```
    Moodi.xcworkspace/
    ├── Moodi/                          # Main app target
    │   ├── MoodiApp.swift             # SwiftUI app entry point
    │   └── ContentView.swift          # Root view integration
    └── MoodiPackage/                   # Swift Package with modular features
        ├── Sources/
        │   ├── AppFeature/            # Root app coordinator
        │   ├── NetworkClient/         # API communication protocol
        │   └── AudioRecorderClient/   # Audio recording protocol
        └── Tests/
            └── AppFeatureTests/       # Swift Testing framework tests
    ```

    ### Feature Architecture Pattern

    **Two-Layer Separation**:
    1. **Client Module** (Protocol Layer) - Defines interfaces using `@DependencyClient`
    2. **Feature Module** (UI + Logic Layer) - SwiftUI views and TCA reducers

    ### Key Features Implemented

    #### 1. AppFeature (Root Coordinator)
    - **State Management**: Mood tracking
  - reflection cards
  - |-
    recording state
    - **User Interface**: Gradient backgrounds
  - mood selector
  - |-
    reflection carousel
    - **Navigation**: No tab bar - single-flow experience
    - **Lifecycle Management**: App initialization and feature coordination

    #### 2. Audio Recording System
    - **AVFoundation Integration**: High-quality M4A recording with AAC compression
    - **Real-time Updates**: Power level monitoring and duration tracking
    - **Actor-based Architecture**: Thread-safe recording management
    - **Temporary File Management**: Automatic cleanup of recording files

    #### 3. Network Integration
    - **API Clients**: n8n webhook integration for prompt enhancement
    - **Slang API**: Speech-to-text transcription using Deepgram Nova-2
    - **Multipart Upload**: Binary audio file transmission
    - **Error Handling**: Comprehensive HTTP status code management

    #### 4. UI Components
    - **Reflection Cards Carousel**: 3D rotation effects with drag gestures
    - **Mood Selector**: Interactive emoji-based mood tracking
    - **Recording Interface**: Three-state microphone button (idle/recording/transcribing)
    - **Gradient Design System**: Warm
  - "calming color palette\n\n### Testing Framework\n- **Swift Testing** (not XCTest) using `@Test` attributes and `#expect()` assertions\n- **TCA TestStore**: Deterministic state testing with action verification\n- **Mock Dependencies**: Protocol-based dependency injection for testing\n\n## \U0001F504 n8n Cloud Workflow System\n\n### Infrastructure\n- **Platform**: n8n Cloud (Pro plan)\n- **Base URL**: `https://dyrtydata.app.n8n.cloud`\n- **API Access**: JWT-based authentication with personal access tokens\n- **Execution Model**: Webhook-triggered workflows with asynchronous processing\n\n### Workflow 1: \"Moodi - carousel\"\n**Purpose**: Dynamic content generation for reflection cards\n- **Trigger**: GET webhook endpoint\n- **Output**: JSON array of reflection questions\n- **Integration**: Feeds AppFeature's reflection card carousel\n\n### Workflow 2: \"Enhance Prompt - Generate Media\"\n**Purpose**: AI-powered content generation pipeline with safety filtering\n\n#### Tech Stack & Nodes:\n1. **Content Safety Pipeline**:\n   - **Text Classifier** (LangChain): NSFW content detection with 6 categories\n   - **OpenRouter Chat Model**: GPT-4o-mini for classification\n   - **Switch Logic**: Routes safe content vs. blocks unsafe content\n\n2. **AI Enhancement Layer**:\n   - **OpenRouter Integration**: GPT-4o for prompt enhancement\n   - **LangChain AI Agents**: Specialized for image and video prompt generation\n   - **Sarcastic Tone**: Custom system messages for elevated mood\n\n3. **Media Generation Pipeline**:\n   - **Runware AI**: Image generation using Flux model (runware:108@1)\n     - 1024x1024 JPEG output\n     - FlowMatchEulerDiscreteScheduler\n     - 18 steps"
  - "CFG Scale 1\n   - **ElevenLabs**: Text-to-speech using voice ID `JBFqnCBsd6RMkjVDRZzb`\n     - Model: eleven_multilingual_v2\n     - Output: MP3 44.1kHz 128kbps\n\n4. **File Management Solution**:\n   - **file.io Integration**: Temporary URL generation for audio files\n   - **1-day Expiry**: Automatic cleanup of uploaded content\n   - **Binary-to-URL Conversion**: Solves Veed API requirement issue\n\n5. **Video Synthesis**:\n   - **Veed API**: Final video generation using Fabric-1.0 model\n   - **720p Resolution**: Standard definition output\n   - **Webhook Callback**: Asynchronous processing notification\n\n\n### Workflow 3: \"My workflow\"\n**Purpose**: General utility workflow (details not specified in current implementation)\n\n## \U0001F517 Integration Architecture\n\n### API Communication Flow\n\n1. **App → n8n**:\n   ```swift\n   // NetworkClient.swift\n   let url = URL(string: \"https://dyrtydata.app.n8n.cloud/webhook-test/enhance_prompt\")!\n   let body = EnhancePromptRequest(prompt: prompt"
  - "type: type.rawValue)\n   ```\n\n2. **n8n → External APIs**:\n   - **Runware**: Image generation\n   - **ElevenLabs**: Audio synthesis\n   - **file.io**: Temporary file hosting\n   - **Veed**: Video composition\n\n3. **External → App**:\n   - **Slang API**: Audio transcription using Deepgram Nova-2\n   ```swift\n   let url = URL(string: \"https://api.slng.ai/v1/stt/deepgram/nova-2\")!\n   // Multipart form data upload with M4A audio\n   ```\n\n### Data Flow Architecture\n\n```\nUser Input (Voice/Text)\n    ↓\n[Moodi App] Audio Recording (AVFoundation)\n    ↓\n[Slang API] Speech-to-Text Transcription\n    ↓\n[n8n Workflow] Content Safety Check\n    ↓\n[OpenRouter] AI Prompt Enhancement\n    ↓\n[Runware + ElevenLabs] Parallel Media Generation\n    ↓\n[file.io] URL Generation for Audio\n    ↓\n[Code Node] Synchronization Logic\n    ↓\n[Veed API] Final Video Synthesis\n    ↓\n[Webhook] Completion Notification\n```\n\n\n### Content Safety\n- **Multi-layer Filtering**: Text classification before processing\n- **Category-based Blocking**: 5 NSFW categories + safe category\n- **Automatic Rejection**: Unsafe content gets \"I cannot help with:\" response\n\n## \U0001F4CA Performance & Scalability\n\n### Async Processing\n- **n8n Webhooks**: Non-blocking workflow execution\n- **Swift Concurrency**: Actor-based audio recording\n- **TCA Effects**: Side effect management with `.run` effects\n- **Streaming Updates**: Real-time recording feedback\n\n### Error Handling\n- **Network Resilience**: HTTP status code validation\n- **Graceful Degradation**: Fallback UI states for failed operations\n- **Comprehensive Logging**: Console output for debugging\n- **User Feedback**: Loading states and error messages\n\n\nThis comprehensive system demonstrates modern iOS development practices integrated with powerful cloud-based AI workflows"
  - creating a seamless user experience for mood tracking and content generation.
youtubeLink: ''
hackers:
  - name: Diana Chang
    description: ''
    image:
      src: ''
    links: {}
  - name: Ibrahim Koteish
    description: ''
    image:
      src: ''
    links: {}
links:
  github: 'https://github.com/ibrahimkteish/Moodi'
---

# Comprehensive Project Documentation: Moodi App & n8n Workflow Integration

## Project Overview

This project consists of two interconnected systems:

1. **Moodi iOS/macOS App** - A SwiftUI-based mood tracking and reflection application
2. **n8n Cloud Workflows** - Three automated workflows for content generation and processing

## 🍎 Moodi iOS/macOS Application

### Architecture & Tech Stack

**Core Framework**: SwiftUI with **The Composable Architecture (TCA)** by Point-Free

- **Language**: Swift 6.2+
- **Platforms**: iOS 17+, macOS 15+
- **Architecture Pattern**: Unidirectional data flow with reducer-based state management

### Point-Free Ecosystem Dependencies

1. **swift-composable-architecture** (v1.22.3)

   - Primary state management framework
   - Reducer-based architecture with side effect management
   - Time-travel debugging capabilities

2. **swift-dependencies** (v1.10.0)

   - Dependency injection framework
   - `@DependencyClient` macro for protocol-based testing
   - Mock implementations for unit testing

3. **swift-tagged** (v0.10.0)

   - Type-safe identifiers and wrapper types
   - Prevents ID mixing across different entity types

4. **swift-identified-collections** (v1.1.1)

   - Collections indexed by identifiable elements
   - Efficient lookups, updates, and diffing by ID

5. **swift-concurrency-extras** (v1.3.2)
   - Swift concurrency utilities and extensions

### Project Structure

```
Moodi.xcworkspace/
├── Moodi/                          # Main app target
│   ├── MoodiApp.swift             # SwiftUI app entry point
│   └── ContentView.swift          # Root view integration
└── MoodiPackage/                   # Swift Package with modular features
    ├── Sources/
    │   ├── AppFeature/            # Root app coordinator
    │   ├── NetworkClient/         # API communication protocol
    │   └── AudioRecorderClient/   # Audio recording protocol
    └── Tests/
        └── AppFeatureTests/       # Swift Testing framework tests
```

### Feature Architecture Pattern

**Two-Layer Separation**:

1. **Client Module** (Protocol Layer) - Defines interfaces using `@DependencyClient`
2. **Feature Module** (UI + Logic Layer) - SwiftUI views and TCA reducers

### Key Features Implemented

#### 1. AppFeature (Root Coordinator)

- **State Management**: Mood tracking, reflection cards, recording state
- **User Interface**: Gradient backgrounds, mood selector, reflection carousel
- **Navigation**: No tab bar - single-flow experience
- **Lifecycle Management**: App initialization and feature coordination

#### 2. Audio Recording System

- **AVFoundation Integration**: High-quality M4A recording with AAC compression
- **Real-time Updates**: Power level monitoring and duration tracking
- **Actor-based Architecture**: Thread-safe recording management
- **Temporary File Management**: Automatic cleanup of recording files

#### 3. Network Integration

- **API Clients**: n8n webhook integration for prompt enhancement
- **Slang API**: Speech-to-text transcription using Deepgram Nova-2
- **Multipart Upload**: Binary audio file transmission
- **Error Handling**: Comprehensive HTTP status code management

#### 4. UI Components

- **Reflection Cards Carousel**: 3D rotation effects with drag gestures
- **Mood Selector**: Interactive emoji-based mood tracking
- **Recording Interface**: Three-state microphone button (idle/recording/transcribing)
- **Gradient Design System**: Warm, calming color palette

### Testing Framework

- **Swift Testing** (not XCTest) using `@Test` attributes and `#expect()` assertions
- **TCA TestStore**: Deterministic state testing with action verification
- **Mock Dependencies**: Protocol-based dependency injection for testing

## 🔄 n8n Cloud Workflow System

### Infrastructure

- **Platform**: n8n Cloud (Pro plan)
- **Base URL**: `https://dyrtydata.app.n8n.cloud`
- **API Access**: JWT-based authentication with personal access tokens
- **Execution Model**: Webhook-triggered workflows with asynchronous processing

### Workflow 1: "Moodi - carousel"

**Purpose**: Dynamic content generation for reflection cards

- **Trigger**: GET webhook endpoint
- **Output**: JSON array of reflection questions
- **Integration**: Feeds AppFeature's reflection card carousel

### Workflow 2: "Enhance Prompt - Generate Media"

**Purpose**: AI-powered content generation pipeline with safety filtering

#### Tech Stack & Nodes:

1. **Content Safety Pipeline**:

   - **Text Classifier** (LangChain): NSFW content detection with 6 categories
   - **OpenRouter Chat Model**: GPT-4o-mini for classification
   - **Switch Logic**: Routes safe content vs. blocks unsafe content

2. **AI Enhancement Layer**:

   - **OpenRouter Integration**: GPT-4o for prompt enhancement
   - **LangChain AI Agents**: Specialized for image and video prompt generation
   - **Sarcastic Tone**: Custom system messages for elevated mood

3. **Media Generation Pipeline**:

   - **Runware AI**: Image generation using Flux model (runware:108@1)
     - 1024x1024 JPEG output
     - FlowMatchEulerDiscreteScheduler
     - 18 steps, CFG Scale 1
   - **ElevenLabs**: Text-to-speech using voice ID `JBFqnCBsd6RMkjVDRZzb`
     - Model: eleven_multilingual_v2
     - Output: MP3 44.1kHz 128kbps

4. **File Management Solution**:

   - **file.io Integration**: Temporary URL generation for audio files
   - **1-day Expiry**: Automatic cleanup of uploaded content
   - **Binary-to-URL Conversion**: Solves Veed API requirement issue

5. **Video Synthesis**:
   - **Veed API**: Final video generation using Fabric-1.0 model
   - **720p Resolution**: Standard definition output
   - **Webhook Callback**: Asynchronous processing notification

### Workflow 3: "My workflow"

**Purpose**: General utility workflow (details not specified in current implementation)

## 🔗 Integration Architecture

### API Communication Flow

1. **App → n8n**:

   ```swift
   // NetworkClient.swift
   let url = URL(string: "https://dyrtydata.app.n8n.cloud/webhook-test/enhance_prompt")!
   let body = EnhancePromptRequest(prompt: prompt, type: type.rawValue)
   ```

2. **n8n → External APIs**:

   - **Runware**: Image generation
   - **ElevenLabs**: Audio synthesis
   - **file.io**: Temporary file hosting
   - **Veed**: Video composition

3. **External → App**:
   - **Slang API**: Audio transcription using Deepgram Nova-2
   ```swift
   let url = URL(string: "https://api.slng.ai/v1/stt/deepgram/nova-2")!
   // Multipart form data upload with M4A audio
   ```

### Data Flow Architecture

```
User Input (Voice/Text)
    ↓
[Moodi App] Audio Recording (AVFoundation)
    ↓
[Slang API] Speech-to-Text Transcription
    ↓
[n8n Workflow] Content Safety Check
    ↓
[OpenRouter] AI Prompt Enhancement
    ↓
[Runware + ElevenLabs] Parallel Media Generation
    ↓
[file.io] URL Generation for Audio
    ↓
[Code Node] Synchronization Logic
    ↓
[Veed API] Final Video Synthesis
    ↓
[Webhook] Completion Notification
```

### Content Safety

- **Multi-layer Filtering**: Text classification before processing
- **Category-based Blocking**: 5 NSFW categories + safe category
- **Automatic Rejection**: Unsafe content gets "I cannot help with:" response

## 📊 Performance & Scalability

### Async Processing

- **n8n Webhooks**: Non-blocking workflow execution
- **Swift Concurrency**: Actor-based audio recording
- **TCA Effects**: Side effect management with `.run` effects
- **Streaming Updates**: Real-time recording feedback

### Error Handling

- **Network Resilience**: HTTP status code validation
- **Graceful Degradation**: Fallback UI states for failed operations
- **Comprehensive Logging**: Console output for debugging
- **User Feedback**: Loading states and error messages

This comprehensive system demonstrates modern iOS development practices integrated with powerful cloud-based AI workflows, creating a seamless user experience for mood tracking and content generation.
