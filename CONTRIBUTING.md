# Contributing to NeighborKnot

Thank you for your interest in contributing to NeighborKnot! We welcome contributions from everyone. This document provides guidelines and instructions for contributing.

## Code of Conduct

We are committed to providing a welcoming and inspiring community for all. Please read and adhere to our Code of Conduct:

- Be respectful and inclusive
- Welcome people regardless of background
- Focus on what is best for the community
- Show empathy towards other members
- Report any inappropriate behavior

## Getting Started

### 1. Fork the Repository

Click the "Fork" button on GitHub to create your own copy of the repository.

### 2. Clone Your Fork

```bash
git clone https://github.com/YOUR_USERNAME/NeighborKnot.git
cd NeighborKnot
git remote add upstream https://github.com/ORIGINAL_OWNER/NeighborKnot.git
```

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

Use descriptive branch names:
- `feature/add-video-calling` - for new features
- `fix/login-bug` - for bug fixes
- `docs/update-readme` - for documentation
- `refactor/optimize-dashboard` - for refactoring

## Development Guidelines

### Code Style

- **JavaScript**: Use ES6+ syntax
  - Use `const` and `let` instead of `var`
  - Use arrow functions where appropriate
  - Use template literals for strings
  - Add JSDoc comments for functions

```javascript
/**
 * Fetches user skills based on ID
 * @param {string} userId - The user ID
 * @returns {Promise<Array>} Array of skills
 */
async function getUserSkills(userId) {
  // implementation
}
```

- **CSS**: Follow BEM naming convention
  - `.block` - main component
  - `.block__element` - part of block
  - `.block--modifier` - variation

```css
.skill-card { }
.skill-card__title { }
.skill-card__description { }
.skill-card--featured { }
```

- **HTML**: Use semantic HTML5
  - Use proper heading hierarchy
  - Use semantic elements (`<header>`, `<nav>`, `<main>`, `<footer>`)
  - Ensure proper accessibility attributes

### Naming Conventions

- **Variables**: camelCase (`userName`, `isLoggedIn`)
- **Functions**: camelCase (`getUserProfile`, `addSkill`)
- **Classes**: PascalCase (`Dashboard`, `AuthManager`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_TOKENS`, `DEFAULT_LEVEL`)
- **CSS Classes**: kebab-case (`.user-profile`, `.skill-card`)

### File Organization

```
Feature module should follow:
├── module-name.html (if applicable)
├── js/module-name.js (logic)
├── css/module-name.css (styles)
```

## Commit Messages

Use clear and descriptive commit messages following this format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat` - A new feature
- `fix` - A bug fix
- `docs` - Documentation only
- `style` - Changes that don't affect functionality
- `refactor` - Code refactoring without feature changes
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `chore` - Build, dependencies, or tooling changes

**Examples:**
```
feat(dashboard): add skill management UI
fix(auth): resolve email validation issue
docs(readme): update installation instructions
refactor(auth): simplify auth module structure
```

## Testing

### Manual Testing Checklist

Before submitting a PR, test:

- [ ] Feature works on desktop
- [ ] Feature works on mobile
- [ ] Feature works on tablet
- [ ] No console errors
- [ ] Form validation works
- [ ] Error messages display correctly
- [ ] Loading states work
- [ ] Responsive design works

### Test Across Browsers

- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

## Pull Request Process

### 1. Update Your Branch

```bash
# Fetch latest from upstream
git fetch upstream

# Rebase your branch
git rebase upstream/main

# Push to your fork
git push -f origin your-branch-name
```

### 2. Create Pull Request

1. Go to the original repository
2. Click "New Pull Request"
3. Select your fork and branch
4. Fill out the PR template
5. Click "Create Pull Request"

### 3. PR Description Template

```markdown
## Description
Brief description of your changes

## Type of Change
- [ ] Bug fix (fixes an issue)
- [ ] New feature (adds functionality)
- [ ] Breaking change (causes existing functionality to change)
- [ ] Documentation update

## Related Issues
Fixes #(issue number)

## Changes
- Describe your changes
- List relevant modifications

## Testing
Describe how you tested your changes:
- Test A
- Test B

## Screenshots (if applicable)
Add screenshots of UI changes

## Checklist
- [ ] My code follows the style guidelines
- [ ] I've updated documentation
- [ ] No new warnings generated
- [ ] I've added tests for new code
- [ ] All tests pass locally
```

### 4. Code Review

- Maintainers will review your PR
- Address feedback and comments
- Make requested changes
- Push updates to your branch (no need to recreate PR)

### 5. Merge

Once approved, your PR will be merged! 🎉

## Feature Suggestions

Have an idea for a new feature?

1. **Check existing issues** - Ensure it hasn't been suggested
2. **Create an issue** - Describe your feature and use case
3. **Get feedback** - Discuss with maintainers
4. **Implement** - Follow the contribution process above

## Bug Reports

Found a bug? Help us fix it!

1. **Search existing issues** - Check if it's already reported
2. **Create an issue** - Provide:
   - Clear description
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment (browser, OS)
   - Screenshots/error logs

## Documentation

Help us improve documentation!

- **README**: Update feature descriptions
- **SETUP**: Improve setup instructions  
- **Inline comments**: Clarify code logic
- **API docs**: Document functions and classes
- **Examples**: Add usage examples

## Development Tips

### Useful Commands

```bash
# Start development server
npm start

# Quick restart
npm run restart

# Clear cache
npm run clean

# Run tests
npm test

# Deploy
npm run deploy
```

### Browser DevTools

- Use Chrome DevTools for debugging
- Set breakpoints and step through code
- Inspect element styles
- Monitor network requests
- Check localStorage and sessionStorage

### Performance Profiling

```javascript
// Measure function performance
console.time('function-name');
// your code
console.timeEnd('function-name');
```

## Help and Questions

- Check existing documentation
- Search GitHub issues
- Ask in PR comments
- Email: dev@neighborknot.com

## Recognition

Contributors will be recognized in:
- GitHub contributors page
- Project documentation
- Community announcements

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Additional Resources

- [Git Workflow Guide](https://git-scm.com/book/en/v2)
- [GitHub Docs](https://docs.github.com)
- [Web Development Best Practices](https://developer.mozilla.org/en-US/docs/Web)

---

Thank you for contributing to NeighborKnot! Your efforts help build a better community. 💚
