# Testing Built-in Code

This is the article introduction

## Code Block 1
```javascript
console.log('Hello World!');
```

## Code Block 2
```java
System.out.println('Hello World!');
```

## Code Block 3
```json
{
    "name": "Hello World!",
    "age": 18,
    "sex": "male"
}
```

## Code Block 4
```css
.markdown-content {
    line-height: 1.6;
    word-wrap: break-word;
    
    p {
        margin: 1em 0;
    }

    h1, h2, h3, h4, h5, h6 {
        margin-top: 1.5em;
        margin-bottom: 1em;
    }

    code {
        padding: 0.2em 0.4em;
        background-color: rgba(27, 31, 35, 0.05);
        border-radius: 3px;
    }

    pre {
        position: relative;
        padding: 16px 0;
        margin: 0;
        background-color: #f6f8fa;

        .code-block-wrapper {
            display: flex;
            font-family: Consolas, Monaco, 'Courier New', monospace;
            font-size: 14px;
            
            .line-numbers {
                user-select: none;
                text-align: right;
                padding: 0 12px;
                color: #999;
                background-color: #f6f8fa;
                border-right: 1px solid #ddd;
                
                .line-number {
                    display: block;
                    line-height: 1.6;
                }
            }
            
            .code-content {
                padding: 0 16px;
                overflow-x: auto;
                flex: 1;

                > code {
                    display: block;
                    line-height: 20px;
                }
            }
        }

        code {
            padding: 0;
            background-color: transparent;
            
            // Add highlight-related styles
            .hljs-keyword,
            .hljs-selector-tag,
            .hljs-built_in,
            .hljs-name,
            .hljs-tag {
                color: #d73a49;
            }

            .hljs-string,
            .hljs-title,
            .hljs-section,
            .hljs-attribute,
            .hljs-literal,
            .hljs-template-tag,
            .hljs-template-variable,
            .hljs-type,
            .hljs-addition {
                color: #032f62;
            }

            .hljs-comment,
            .hljs-quote,
            .hljs-deletion,
            .hljs-meta {
                color: #6a737d;
            }

            .hljs-number,
            .hljs-regexp,
            .hljs-symbol,
            .hljs-variable,
            .hljs-template-variable,
            .hljs-link,
            .hljs-selector-attr,
            .hljs-selector-pseudo {
                color: #005cc5;
            }
        }
    }
}
```