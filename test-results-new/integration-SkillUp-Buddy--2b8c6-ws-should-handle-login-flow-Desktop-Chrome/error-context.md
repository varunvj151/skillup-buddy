# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list
  - region "Notifications alt+T"
  - generic [ref=e3]:
    - generic [ref=e5]:
      - img "SkillUp Buddy Logo" [ref=e7]
      - generic [ref=e8]: SkillUp Buddy
    - generic [ref=e16]:
      - heading "Sign-in" [level=1] [ref=e17]
      - generic [ref=e18]:
        - button "Google Continue with Google" [ref=e19] [cursor=pointer]:
          - img "Google" [ref=e20]
          - text: Continue with Google
        - button "f Continue with Facebook" [disabled]:
          - generic: f
          - text: Continue with Facebook
        - button " Continue with Apple" [disabled]:
          - generic: 
          - text: Continue with Apple
      - generic [ref=e25]: or
      - generic [ref=e26]:
        - textbox "Email" [ref=e28]: test@example.com
        - textbox "Password" [ref=e30]: password123
        - button "Login" [ref=e31] [cursor=pointer]
      - button "Don't have an account? Register" [ref=e33] [cursor=pointer]
```