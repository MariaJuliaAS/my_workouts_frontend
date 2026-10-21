import type { WorkoutProps } from "../pages/workout";

export function workoutToText(workout: WorkoutProps): string {
    const lines: string[] = [];

    lines.push(`TREINO: ${workout.name}`);
    lines.push("=".repeat(30));
    lines.push("");

    if (!workout.exercises || workout.exercises.length === 0) {
        lines.push("Nenhum exercício cadastrado.");
    } else {
        workout.exercises.forEach((ex, index) => {
            lines.push(`${index + 1}. ${ex.name}`);
            lines.push(`   Séries: ${ex.sets} | Repetições: ${ex.reps}`);
            if (ex.notes?.trim()) {
                lines.push(`   Obs: ${ex.notes}`);
            }
            lines.push("");
        });
    }

    return lines.join("\n");
}

export function downloadTextFile(content: string, filename: string) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
}