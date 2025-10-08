
import React, { useState, useMemo } from 'react';
import { TrainingKitReport, QuizQuestion } from '../types';
import { generateQuizResultPdf } from '../services/pdfGenerator';

interface TrainingKitViewerProps {
  data: TrainingKitReport;
}

const QuizInProgress: React.FC<{
  quiz: QuizQuestion[];
  onSubmit: (answers: (string | null)[]) => void;
}> = ({ quiz, onSubmit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>(Array(quiz.length).fill(null));

  const currentQuestion = quiz[currentQuestionIndex];
  
  const handleAnswerSelect = (option: string) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = option;
    setAnswers(newAnswers);

    if (currentQuestionIndex < quiz.length - 1) {
      setTimeout(() => {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }, 300);
    } else {
      onSubmit(newAnswers);
    }
  };

  const progress = ((currentQuestionIndex + 1) / quiz.length) * 100;

  return (
    <div className="not-prose animate-fade-in">
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-base font-medium text-greatek-blue">Pergunta {currentQuestionIndex + 1} de {quiz.length}</span>
        </div>
        <div className="w-full bg-greatek-border rounded-full h-2.5">
          <div className="bg-greatek-blue h-2.5 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      
      <div className="p-4 border border-greatek-border rounded-lg bg-white">
        <p className="font-semibold text-text-primary mb-4">{currentQuestion.question}</p>
        <div className="space-y-3">
          {currentQuestion.options.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswerSelect(option)}
              className={`w-full text-left p-3 rounded-lg border-2 transition-all duration-200 
                ${answers[currentQuestionIndex] === option 
                  ? 'bg-greatek-blue/20 border-greatek-blue font-semibold' 
                  : 'bg-greatek-bg-light hover:bg-greatek-border/50 border-transparent'
                }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const QuizResults: React.FC<{
  quiz: QuizQuestion[];
  userAnswers: (string | null)[];
  onRestart: () => void;
  productName: string;
}> = ({ quiz, userAnswers, onRestart, productName }) => {
    const { score, correctCount, incorrectAnswers } = useMemo(() => {
        let correct = 0;
        const incorrect: { question: QuizQuestion; userAnswer: string | null }[] = [];
        quiz.forEach((q, i) => {
            if (q.correct_answer === userAnswers[i]) {
                correct++;
            } else {
                incorrect.push({ question: q, userAnswer: userAnswers[i] });
            }
        });
        return {
            score: Math.round((correct / quiz.length) * 100),
            correctCount: correct,
            incorrectAnswers: incorrect,
        };
    }, [quiz, userAnswers]);

    const handleExport = () => {
        generateQuizResultPdf(productName, quiz, userAnswers, score);
    };

    return (
        <div className="not-prose text-center animate-fade-in">
            <h4 className="text-2xl font-bold text-greatek-dark-blue">Quiz Finalizado!</h4>
            <p className="text-lg text-text-secondary mt-2">Você acertou {correctCount} de {quiz.length} perguntas.</p>
            
            <div className="my-6">
                <div className="text-5xl font-bold text-greatek-blue">{score}%</div>
                <div className="text-sm uppercase text-text-secondary/80 tracking-wider">de aproveitamento</div>
            </div>

            {incorrectAnswers.length > 0 && (
                <div className="mt-8 text-left">
                    <h5 className="text-lg font-semibold text-text-primary mb-4">Vamos revisar o que você errou:</h5>
                    <div className="space-y-4">
                        {incorrectAnswers.map(({ question, userAnswer }, index) => (
                            <div key={index} className="p-4 border border-red-200 bg-red-50 rounded-lg">
                                <p className="font-semibold text-text-primary">{question.question}</p>
                                <p className="mt-2 text-sm text-red-700">
                                    <i className="bi bi-x-circle-fill mr-2"></i>
                                    Sua resposta: <span className="font-mono bg-red-100 px-1 rounded">{userAnswer || 'Não respondido'}</span>
                                </p>
                                <p className="mt-1 text-sm text-green-700">
                                    <i className="bi bi-check-circle-fill mr-2"></i>
                                    Resposta correta: <span className="font-mono bg-green-100 px-1 rounded">{question.correct_answer}</span>
                                </p>
                                <div className="mt-3 pt-3 border-t border-red-200">
                                    <p className="text-xs font-semibold text-greatek-dark-blue">Justificativa:</p>
                                    <p className="text-sm text-text-secondary mt-1">{question.explanation}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="mt-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                <button
                    onClick={onRestart}
                    className="w-full sm:w-auto px-6 py-2 bg-white text-greatek-dark-blue border border-greatek-border font-semibold rounded-lg hover:bg-greatek-bg-light transition-colors"
                >
                    Tentar Novamente
                </button>
                <button
                    onClick={handleExport}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-greatek-blue text-white font-semibold rounded-lg hover:bg-greatek-dark-blue transition-colors"
                >
                    <i className="bi bi-file-earmark-pdf-fill"></i>
                    Exportar Resultados
                </button>
            </div>
        </div>
    );
};


const TrainingKitViewer: React.FC<TrainingKitViewerProps> = ({ data }) => {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  const [quizState, setQuizState] = useState<'not_started' | 'in_progress' | 'finished'>('not_started');
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };
  
  const handleQuizSubmit = (answers: (string | null)[]) => {
      setUserAnswers(answers);
      setQuizState('finished');
  };
  
  const handleRestartQuiz = () => {
      setUserAnswers([]);
      setQuizState('in_progress');
  };

  const formatReportForCopy = () => {
    let text = `--- Kit de Treinamento: ${data.product_name} ---\n\n`;
    text += "## Pontos-Chave de Venda\n";
    data.key_selling_points.forEach(point => text += `- ${point}\n`);

    text += "\n## FAQ Técnico\n";
    data.technical_faq.forEach(faq => text += `P: ${faq.q}\nR: ${faq.a}\n\n`);

    text += "\n## Quiz de Conhecimento\n";
    data.knowledge_quiz.forEach((q, i) => {
      text += `${i + 1}. ${q.question}\n`;
      q.options.forEach(opt => text += `   - ${opt}\n`);
      text += `   Resposta Correta: ${q.correct_answer}\n`;
      text += `   Justificativa: ${q.explanation}\n\n`;
    });

    return text;
  };

  const handleCopy = () => {
    const reportText = formatReportForCopy();
    navigator.clipboard.writeText(reportText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="prose max-w-none">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-greatek-border">
        <h2 className="text-lg font-semibold text-greatek-dark-blue not-prose m-0">Kit de Treinamento: {data.product_name}</h2>
        <button
          onClick={handleCopy}
          className="flex items-center space-x-1.5 text-xs bg-white hover:bg-greatek-bg-light text-text-secondary font-medium py-1.5 px-3 rounded-md transition-colors border border-gray-300"
        >
          {copied ? <i className="bi bi-check-lg text-green-500"></i> : <i className="bi bi-clipboard"></i>}
          <span className="ml-1.5">{copied ? 'Copiado!' : 'Copiar Kit'}</span>
        </button>
      </div>

      <div className="space-y-6">
        {quizState !== 'in_progress' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h3 className="text-xl font-semibold text-text-primary flex items-center"><i className="bi bi-star-fill text-yellow-500 mr-3"></i>Pontos-Chave de Venda</h3>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                {data.key_selling_points.map((point, idx) => (
                  <li key={idx} className="text-text-secondary leading-relaxed">{point}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-text-primary flex items-center"><i className="bi bi-patch-question-fill text-greatek-blue mr-3"></i>FAQ Técnico</h3>
              <div className="mt-2 space-y-2 not-prose">
                {data.technical_faq.map((faq, idx) => (
                  <div key={idx} className="border border-greatek-border rounded-lg overflow-hidden">
                    <button onClick={() => toggleFaq(idx)} className="w-full flex justify-between items-center text-left p-3 bg-greatek-bg-light hover:bg-greatek-border/50 transition-colors">
                      <span className="font-medium text-sm text-greatek-dark-blue">{faq.q}</span>
                      <i className={`bi bi-chevron-down transition-transform ${openFaq === idx ? 'rotate-180' : ''}`}></i>
                    </button>
                    {openFaq === idx && (
                      <div className="p-3 text-sm text-text-secondary bg-white animate-fade-in-down">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div>
          <h3 className="text-xl font-semibold text-text-primary flex items-center"><i className="bi bi-card-checklist text-green-600 mr-3"></i>Quiz de Conhecimento</h3>
           <div className="mt-2">
            {quizState === 'not_started' && (
                <div className="text-center p-6 bg-greatek-bg-light rounded-lg animate-fade-in">
                    <p className="text-text-secondary">Teste seus conhecimentos sobre o {data.product_name}.</p>
                    <button 
                        onClick={() => setQuizState('in_progress')}
                        className="mt-4 px-6 py-2 bg-greatek-blue text-white font-semibold rounded-lg hover:bg-greatek-dark-blue transition-colors"
                    >
                        Iniciar Quiz
                    </button>
                </div>
            )}
            {quizState === 'in_progress' && (
                <QuizInProgress quiz={data.knowledge_quiz} onSubmit={handleQuizSubmit} />
            )}
            {quizState === 'finished' && (
                <QuizResults quiz={data.knowledge_quiz} userAnswers={userAnswers} onRestart={handleRestartQuiz} productName={data.product_name} />
            )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingKitViewer;