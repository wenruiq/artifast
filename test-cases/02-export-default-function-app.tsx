import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Star, ThumbsUp } from "lucide-react";

export default function App() {
  const [likes, setLikes] = useState(0);
  const [hearts, setHearts] = useState(0);
  const [stars, setStars] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-8">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Reaction Counter</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-around">
          <button
            onClick={() => setLikes((l) => l + 1)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-blue-50 transition-colors"
          >
            <ThumbsUp className="w-8 h-8 text-blue-500" />
            <span className="text-2xl font-bold text-blue-600">{likes}</span>
          </button>
          <button
            onClick={() => setHearts((h) => h + 1)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-red-50 transition-colors"
          >
            <Heart className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold text-red-600">{hearts}</span>
          </button>
          <button
            onClick={() => setStars((s) => s + 1)}
            className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-yellow-50 transition-colors"
          >
            <Star className="w-8 h-8 text-yellow-500" />
            <span className="text-2xl font-bold text-yellow-600">{stars}</span>
          </button>
        </CardContent>
      </Card>
    </div>
  );
}
