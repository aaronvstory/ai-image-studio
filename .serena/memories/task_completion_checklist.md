# Task Completion Checklist

## Before Committing Code
1. **Run linting**: `npm run lint`
2. **Type checking**: `npm run build` (will fail on errors)
3. **Test on port 3500**: `npm run dev` and verify at http://localhost:3500
4. **Check Convex connection**: Ensure `npx convex dev` is running
5. **Verify authentication**: Test sign-in/sign-up flow
6. **Test responsive design**: Check mobile, tablet, desktop views
7. **Review console**: No errors or warnings in browser console

## After Making UI Changes
1. Check all breakpoints (mobile: 375px, tablet: 768px, desktop: 1440px)
2. Verify dark/light theme compatibility
3. Test interactive states (hover, focus, active, disabled)
4. Ensure loading states are present
5. Validate form inputs and error messages
6. Check accessibility (keyboard navigation, ARIA labels)

## After Database Changes
1. Update Convex schema in `convex/schema.ts`
2. Run `npx convex dev` to sync changes
3. Test real-time sync functionality
4. Verify webhook handlers if applicable
5. Check user data synchronization

## After Configuration Changes
1. Update `.env.example` with new variables
2. Document changes in CLAUDE.md
3. Verify PORT=3500 is maintained
4. Test in both development and production builds
5. Update README.md if user-facing

## Quality Gates
- ✅ No TypeScript errors
- ✅ No ESLint warnings
- ✅ Runs on port 3500
- ✅ Authentication works
- ✅ Database connects
- ✅ Responsive design intact
- ✅ No console errors
- ✅ Loading states present