# Building PrimePost Android APK

This guide explains how to build an installable Android APK for PrimePost.

## Prerequisites

Before building the APK, ensure you have the following installed:

### 1. Java Development Kit (JDK)
- **Required Version**: JDK 17 or higher
- **Download**: [Oracle JDK](https://www.oracle.com/java/technologies/downloads/) or [OpenJDK](https://adoptium.net/)
- **Verify Installation**:
  ```bash
  java -version
  ```

### 2. Android SDK
You have two options:

#### Option A: Android Studio (Recommended)
- **Download**: [Android Studio](https://developer.android.com/studio)
- Install Android Studio and open it once to complete the SDK setup
- The SDK will be installed at:
  - **macOS/Linux**: `~/Android/Sdk`
  - **Windows**: `C:\Users\<username>\AppData\Local\Android\Sdk`

#### Option B: Command Line Tools Only
- **Download**: [Android Command Line Tools](https://developer.android.com/studio#command-tools)
- Extract and set up the SDK manually

### 3. Environment Variables
Set the `ANDROID_HOME` environment variable:

**macOS/Linux** (add to `~/.bashrc`, `~/.zshrc`, or equivalent):
