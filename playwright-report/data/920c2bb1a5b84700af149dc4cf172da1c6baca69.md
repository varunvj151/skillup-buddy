# Page snapshot

```yaml
- generic [ref=e2]:
  - region "Notifications (F8)":
    - list [ref=e4]:
      - listitem [ref=e5]:
        - generic [ref=e6]:
          - generic [ref=e7]: Login failed
          - generic [ref=e8]: Invalid email or password.
        - button [ref=e9] [cursor=pointer]:
          - img [ref=e10]
  - region "Notifications alt+T"
  - generic [ref=e14]:
    - generic [ref=e16]:
      - img "SkillUp Buddy Logo" [ref=e18]
      - generic [ref=e19]: SkillUp Buddy
    - generic [ref=e27]:
      - heading "Sign-in" [level=1] [ref=e28]
      - button "Google Continue with Google" [ref=e30] [cursor=pointer]:
        - img "Google" [ref=e31]
        - text: Continue with Google
      - generic [ref=e36]: or
      - generic [ref=e37]:
        - textbox "Email" [ref=e39]: test@example.com
        - textbox "Password" [ref=e41]: password123
        - button "Login" [ref=e42] [cursor=pointer]
      - button "Don't have an account? Register" [ref=e44] [cursor=pointer]
```