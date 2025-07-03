# Contributing to BucketORM

Thank you for your interest in contributing to BucketORM! We welcome contributions of all kinds.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Docker (for MinIO local development)
- Git

### Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/your-username/bucketorm.git
   cd bucketorm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up local environment**
   ```bash
   cp .env.example .env
   docker-compose up -d
   ```

4. **Run tests and examples**
   ```bash
   npm test
   npm run dev
   ```

## 🎯 Areas for Contribution

### High Priority
- **Testing**: More comprehensive test coverage
- **Documentation**: Examples, tutorials, API docs
- **Performance**: Optimization for large datasets
- **Error Handling**: Better error messages and recovery

### Features We'd Love
- **Query Builder**: SQL-like query syntax
- **Migrations**: Schema versioning and data migration tools
- **CLI**: Command-line tools for data management
- **Caching**: In-memory and Redis caching layers
- **Monitoring**: Metrics and logging integration

### Storage Adapters
- Google Cloud Storage
- Azure Blob Storage
- Local filesystem (for testing)
- Additional S3-compatible services

## 📝 Development Guidelines

### Code Style
We use ESLint and Prettier for code formatting:
```bash
npm run lint
npm run format
```

### TypeScript
- All new code must be TypeScript
- Maintain strict type safety
- Export proper types for consumers
- Document complex types with JSDoc

### Commit Messages
Use conventional commits:
```bash
feat: add query builder support
fix: handle network timeouts properly
docs: update README with new examples
test: add tests for schema validation
```

### Testing
- Write tests for all new features
- Ensure existing tests pass
- Include both unit and integration tests
- Test with both MinIO and real S3 when possible

**Test Isolation Guidelines:**
- Use unique IDs for each test to avoid conflicts
- Tests run against `bucketorm-test` bucket (separate from development)
- Use `beforeEach`/`afterEach` hooks for proper cleanup
- Never use hardcoded IDs - use the `generateTestId()` helper function

```bash
npm test
npm run test:watch
```

## 🔄 Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write code following our guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Test your changes**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

4. **Commit and push**
   ```bash
   git add .
   git commit -m "feat: add your feature"
   git push origin feature/your-feature-name
   ```

5. **Open a Pull Request**
   - Use a clear title and description
   - Reference any related issues
   - Include screenshots/examples if relevant

## 🧪 Testing Strategy

### Local Testing
```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Test with real MinIO
docker-compose up -d
npm run dev
npm run dev:schema
npm run dev:typescript
```

### Manual Testing
- Test with different S3 providers (AWS, MinIO, R2)
- Verify TypeScript types work correctly
- Check error handling and edge cases
- Validate examples and documentation

## 📚 Documentation

### When to Update Docs
- New features or APIs
- Breaking changes
- Configuration changes
- New examples or use cases

### Documentation Files
- `README.md` - Main overview and quick start
- `TYPESCRIPT.md` - TypeScript patterns and best practices
- `CONTRIBUTING.md` - This file
- `/examples` - Working code examples
- JSDoc comments in code

## 🐛 Bug Reports

### Before Reporting
1. Check existing issues
2. Try with latest version
3. Test with minimal reproduction case

### Bug Report Template
```markdown
**Bug Description**
Clear description of the bug

**To Reproduce**
Steps to reproduce the behavior

**Expected Behavior**
What you expected to happen

**Environment**
- BucketORM version:
- Node.js version:
- Storage provider:
- Operating system:

**Code Sample**
Minimal code that reproduces the issue
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Feature Description**
Clear description of the feature

**Use Case**
Why this feature would be useful

**Proposed API**
How you imagine the API would work

**Alternatives**
Any alternative solutions you've considered
```

## 🎨 Design Principles

### API Design
- **TypeScript-First**: Everything should have proper types
- **Familiar**: Similar to Prisma/Sequelize where possible
- **Simple**: Easy to understand and use
- **Flexible**: Support multiple patterns and use cases

### Performance
- **Lazy Loading**: Only load data when needed
- **Minimal Dependencies**: Keep the package lightweight
- **Efficient S3 Usage**: Minimize API calls and bandwidth

### Developer Experience
- **Clear Error Messages**: Help developers debug issues
- **Great Documentation**: Examples and guides for common use cases
- **IDE Support**: Full autocomplete and type checking

## 🏆 Recognition

Contributors will be:
- Listed in the README contributors section
- Credited in release notes
- Invited to our Discord community (when available)

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Code Review**: We'll provide thorough code review feedback

## 📋 Project Structure

```
bucketorm/
├── src/
│   ├── core/           # Core ORM classes
│   │   ├── bucketorm.ts
│   │   ├── model.ts
│   │   └── schema-model.ts
│   ├── adapters/       # Storage adapters
│   │   └── s3.ts
│   ├── types/          # TypeScript definitions
│   │   └── index.ts
│   └── index.ts        # Main exports
├── examples/           # Usage examples
│   ├── basic.ts
│   ├── schema-validation.ts
│   └── typescript-patterns.ts
├── tests/              # Test files
├── docs/               # Additional documentation
└── README.md           # Main documentation
```

## ⚖️ License

By contributing to BucketORM, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to BucketORM! 🚀 