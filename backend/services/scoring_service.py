"""
Health score calculation — pure logic, no AI required.
This runs before the LLM agents so we have a baseline score
to feed into the impact agent.
"""


def calculate_health_score(
    risks: list,
    resource_risks: list,
    scope_changes: list,
    dependencies: list,
) -> int:
    score = 100

    for risk in risks:
        severity = risk.get("severity", "Medium")
        if severity == "High":
            score -= 15
        elif severity == "Medium":
            score -= 10
        else:
            score -= 5

    # Each resource risk = -12
    score -= len(resource_risks) * 12

    # Each scope change = -8
    score -= len(scope_changes) * 8

    # Each dependency blocker = -10
    score -= len(dependencies) * 10

    return max(score, 0)
