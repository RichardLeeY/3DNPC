"use client";
import AnimationSkinningMorph from "@/components/animation-skinning-morph";
import DreamGirl from "@/components/dream-girl";
import Mum from "@/components/mum";
import Richard from "@/components/richard";
import { useSearchParams } from "next/navigation";

const ChatPage = (props: any) => {
  const { cardType = "", isShowList = false } = props;
  const searchParams = useSearchParams();
  const pageType = cardType || searchParams?.get("pageType") || "robot";

  if (isShowList) {
    return (
      <div className="card-show">
        {cardType === "robot" && <AnimationSkinningMorph isShowList />}
        {cardType === "richard" && <Richard isShowList />}
        {cardType === "dream-girl" && <DreamGirl isShowList />}
        {cardType === "mum" && <Mum isShowList />}
      </div>
    );
  }
  return (
    <>
      {pageType === "robot" && <AnimationSkinningMorph />}
      {pageType === "richard" && <Richard />}
      {pageType === "dream-girl" && <DreamGirl />}
      {pageType === "mum" && <Mum />}
    </>
  );
};

export default ChatPage;
