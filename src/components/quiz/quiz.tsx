import { getQuestions } from "@/services/quizService";
import styles from "./quiz.module.css";
import Link from "next/link";

type QuizProps = {
  themes: string[];
  difficulties: string[];
  url: string;
};

const Quiz = async ({
  themes = [],
  difficulties = [],
  url = "",
}: QuizProps) => {
  const data = await getQuestions(themes, difficulties, url);
  const pdfParams = new URLSearchParams();

  themes.forEach((theme) => pdfParams.append("themes", theme));
  difficulties.forEach((difficulty) =>
    pdfParams.append("difficulties", difficulty),
  );

  const pdfDownloadHref = `/api/quiz/pdf?${pdfParams.toString()}`;
  const questions = data.questions;
  return (
    <>
      {/* Navigating to /?generate=false causes Home to set hasGenerated=false,
          which unmounts this entire Quiz component and clears both
          the message container and the questions list */}
      <div className={styles.actionsContainer}>
        <Link href="/?generate=false" className={styles.clearButton}>
          Rensa quiz
        </Link>
        <a href={pdfDownloadHref} className={styles.downloadButton}>
          Ladda ner PDF
        </a>
      </div>
      <div className={styles.messageContainer}>
        <h3 className={styles.heading}>Din sökning</h3>
        <div>
          {themes.length > 0 && (
            <p>
              <strong>Teman:</strong> {themes.join(", ").toUpperCase()}
            </p>
          )}
          {difficulties.length > 0 && (
            <p>
              <strong>Svårighetsgrader:</strong>{" "}
              {difficulties.join(", ").toUpperCase()}
            </p>
          )}
        </div>
      </div>
      <div className={styles.quizContainer}>
        {questions.map((q) => (
          <div className={styles.row} key={q.id}>
            <div className={styles.question}>{q.question}</div>
            <div className={styles.answer}>{q.answer}</div>
          </div>
        ))}
        <div></div>
      </div>
    </>
  );
};

export default Quiz;
