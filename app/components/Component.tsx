2. Open `http://localhost:3000/signup/company` in the browser.

3. Check **browser devtools**:
   - Open DevTools → Console.
   - Reload the page.
   - If there is any red error, tell me the exact text.

4. Try clicking “Create company account” with **valid** data.
   - Does the button change to “Creating workspace…”?
   - Does the red error text appear under the form?
   - Does the network request `/api/onboarding/company-signup` show up in the Network tab?

If the page itself is blank / not loading:

- Make sure there are **no build errors** in the terminal where `npm run dev` is running.
- Look for TypeScript/Next errors like “ReferenceError” or “cannot find module”.
- Paste the exact error line(s) here.

---

## 2. Check Supabase client initialization (most common cause)

Your client setup: