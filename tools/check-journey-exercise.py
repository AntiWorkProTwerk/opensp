"""Review guard and output check for the authored, in-memory lessons.

This AST guard is not a security sandbox. Run only reviewed repository lessons.
The Node caller also limits execution time and output size.
"""

import ast
import contextlib
import io
import json
import sys


def main():
    lesson = json.load(sys.stdin)
    tree = ast.parse(lesson["code"], filename="<guide exercise>")
    allowed_modules = {
        "math", "struct", "zlib", "binascii", "statistics", "collections",
        "dataclasses", "enum", "itertools", "functools", "operator",
        "decimal", "fractions",
    }
    denied_calls = {
        "open", "input", "eval", "exec", "compile", "__import__",
        "getattr", "setattr", "delattr", "globals", "locals", "vars",
        "breakpoint", "help",
    }
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            assert all(alias.name in allowed_modules for alias in node.names), "Only approved standard-library modules are allowed"
        if isinstance(node, ast.ImportFrom):
            assert node.level == 0 and node.module in allowed_modules, "Only approved standard-library modules are allowed"
            assert all(alias.name != "*" for alias in node.names), "Explicit imports required"
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            assert node.func.id not in denied_calls, "File, input or dynamic-code operation found"
        if isinstance(node, ast.Attribute):
            assert not node.attr.startswith("__"), "Runtime introspection is not part of these lessons"
    output = io.StringIO()
    with contextlib.redirect_stdout(output):
        exec(compile(tree, "<guide exercise>", "exec"), {"__name__": "__main__"})
    actual = output.getvalue().replace("\r\n", "\n").rstrip("\n")
    expected = lesson["expected"].replace("\r\n", "\n").rstrip("\n")
    assert actual == expected, f"Output mismatch. Expected {expected!r}, got {actual!r}"


if __name__ == "__main__":
    main()
