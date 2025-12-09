import React, { useEffect, useState } from "react";
import { Alert, AlertTitle, Box, Button } from "@mui/material";
import { getCurrentABVariant } from "../browsee";

type Variant = "A" | "B";

interface SusSurveyBannerProps {
  pageName: string;
}

const SUS_URL_A = "https://1ka.arnes.si/a/21fab734";
const SUS_URL_B = "https://1ka.arnes.si/a/c0f7b4dc";

const getSurveyUrl = (variant: Variant, pageName: string) => {
  const base = variant === "A" ? SUS_URL_A : SUS_URL_B;

  const params = new URLSearchParams({
    page: pageName,
    variant,
  });

  return `${base}?${params.toString()}`;
};

const SusSurveyBanner: React.FC<SusSurveyBannerProps> = ({ pageName }) => {
  const [hidden, setHidden] = useState(false);
  const storageKey = `sus_hidden_${pageName}_v2`;

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey) === "1") {
        setHidden(true);
      }
    } catch {

    }
  }, [storageKey]);

  if (hidden) return null;
  let variant: Variant = "A";
  try {
    const current = getCurrentABVariant();
    if (current === "A" || current === "B") {
      variant = current;
    }
  } catch {
  }

  const surveyUrl = getSurveyUrl(variant, pageName);

  const handleFillClick = () => {
    window.open(surveyUrl, "_blank", "noopener,noreferrer");
    try {
      localStorage.setItem(storageKey, "1");
    } catch {
    }
    setHidden(true);
  };

  return (
    <Box mb={3}>
      <Alert
        severity="info"
        variant="outlined"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 2,
        }}
        action={
          <Button
            color="primary"
            variant="contained"
            size="small"
            onClick={handleFillClick}
          >
            Fill SUS
          </Button>
        }
      >
        <AlertTitle>SUS Questionnaire</AlertTitle>
        After using this page, please complete a short usability
        questionnaire (SUS). It will open in a new tab.
      </Alert>
    </Box>
  );
};

export default SusSurveyBanner;