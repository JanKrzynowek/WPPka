import re
import json
import os

# --- KULOODPORNE ŚCIEŻKI ---
# Pobieramy ścieżkę do folderu, w którym leży TEN skrypt (convert.py)
script_dir = os.path.dirname(os.path.abspath(__file__))

# Sklejamy ścieżkę do pliku wejściowego (musi być w tym samym folderze co skrypt)
INPUT_PATH = os.path.join(script_dir, 'raw_questions.txt')

# Ścieżka wyjściowa (zapisze do src/questions.json względem tego skryptu)
# Jeśli convert.py jest w głównym folderze, to zapisze do src/
OUTPUT_PATH = os.path.join(script_dir, 'src', 'questions.json')

# Jeśli convert.py jest już w folderze src, to zapisze po prostu obok:
if os.path.basename(script_dir) == 'src':
     OUTPUT_PATH = os.path.join(script_dir, 'questions.json')


def parse_questions(text):
    print("Rozpoczynam analizę...")
    
    # Czyszczenie (backslashe i inne śmieci)
    text = text.replace('\\', '')
    text = re.sub(r'--- PAGE \d+ ---', '', text)
    
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    questions = []
    current_q = None
    current_ans_id = None
    
    # Wzorce
    q_start_pattern = re.compile(r'^(\d+)\.\s+(.*)')
    a_start_pattern = re.compile(r'^([a-d])[\)\.]\s*(.*)')
    
    for line in lines:
        q_match = q_start_pattern.match(line)
        if q_match:
            if current_q:
                questions.append(current_q)
            current_q = {
                "id": int(q_match.group(1)),
                "question": q_match.group(2),
                "answers": []
            }
            current_ans_id = None
            continue
            
        if current_q is not None:
            a_match = a_start_pattern.match(line)
            if a_match:
                ans_id = a_match.group(1)
                ans_text = a_match.group(2)
                current_q["answers"].append({"id": ans_id, "text": ans_text})
                current_ans_id = len(current_q["answers"]) - 1
                continue
            
            if current_ans_id is not None:
                current_q["answers"][current_ans_id]["text"] += " " + line
            else:
                current_q["question"] += " " + line

    if current_q:
        questions.append(current_q)
        
    return questions

# --- URUCHOMIENIE ---

print(f"Szukam pliku tutaj: {INPUT_PATH}")

if not os.path.exists(INPUT_PATH):
    print("\n❌ BŁĄD: System nadal nie widzi pliku.")
    print("Sprawdź dwie rzeczy:")
    print(f"1. Czy plik na pewno nazywa się 'raw_questions.txt' (bez spacji, małe litery)?")
    print(f"2. Czy plik leży w tym folderze: {script_dir} ?")
    print("3. Czy nie masz podwójnego rozszerzenia (np. raw_questions.txt.txt)?")
    exit()

try:
    with open(INPUT_PATH, 'r', encoding='utf-8') as f:
        raw_text = f.read()

    questions_data = parse_questions(raw_text)

    # Upewniamy się, że folder docelowy istnieje
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)

    with open(OUTPUT_PATH, 'w', encoding='utf-8') as f:
        json.dump(questions_data, f, indent=2, ensure_ascii=False)

    print("-" * 30)
    print(f"✅ SUKCES! Zapisano {len(questions_data)} pytań.")
    print(f"📁 Plik gotowy w: {OUTPUT_PATH}")
    print("-" * 30)

except Exception as e:
    print(f"❌ Wystąpił błąd: {e}")