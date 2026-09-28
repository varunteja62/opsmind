import os
import json
import logging
from typing import Dict, Any, List, Optional
import httpx
from app.config import settings

logger = logging.getLogger("opsmind.llm")

class LLMService:
    """
    Pluggable LLM Provider Layer
    Easily toggles between Gemini, OpenAI, or intelligent heuristic DevOps analysis.
    """
    def __init__(self):
        self.provider = settings.LLM_PROVIDER.lower()
        self.api_key = settings.LLM_API_KEY
        self.model = settings.LLM_MODEL

    async def analyze_incident(self, title: str, description: str, service: str, logs: Optional[str] = None) -> Dict[str, Any]:
        """
        Extracts structured incident attributes:
        - service
        - environment
        - symptoms
        - error_type
        - possible_causes
        - severity
        - technical_entities
        """
        if self.api_key and self.provider == "gemini":
            try:
                return await self._call_gemini_analysis(title, description, service, logs)
            except Exception as e:
                logger.warning(f"Gemini API call failed ({e}). Falling back to heuristic analyzer.")
        elif self.api_key and self.provider == "openai":
            try:
                return await self._call_openai_analysis(title, description, service, logs)
            except Exception as e:
                logger.warning(f"OpenAI API call failed ({e}). Falling back to heuristic analyzer.")

        # Built-in DevOps heuristic analyzer
        return self._heuristic_analysis(title, description, service, logs)

    async def _call_gemini_analysis(self, title: str, description: str, service: str, logs: Optional[str]) -> Dict[str, Any]:
        prompt = f"""
        You are an expert DevOps and Site Reliability Engineering AI.
        Analyze this incident and return ONLY valid JSON:
        Title: {title}
        Service: {service}
        Description: {description}
        Logs: {logs or 'None'}

        JSON Schema:
        {{
            "service": "{service}",
            "environment": "production",
            "symptoms": ["list of observed symptoms"],
            "error_type": "HTTP status or error name",
            "possible_causes": ["list of 2-3 technical causes"],
            "severity": "critical|high|medium|low",
            "relevant_keywords": ["keywords"],
            "important_technical_entities": {{"key": "value"}}
        }}
        """
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                url,
                json={"contents": [{"parts": [{"text": prompt}]}]}
            )
            data = resp.json()
            raw_text = data["candidates"][0]["content"]["parts"][0]["text"]
            # Clean markdown code blocks
            clean_text = raw_text.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            return json.loads(clean_text)

    async def _call_openai_analysis(self, title: str, description: str, service: str, logs: Optional[str]) -> Dict[str, Any]:
        prompt = f"Analyze incident for service {service}. Title: {title}. Desc: {description}. Logs: {logs}. Return JSON."
        url = "https://api.openai.com/v1/chat/completions"
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(
                url,
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": self.model or "gpt-4o-mini",
                    "messages": [{"role": "user", "content": prompt}],
                    "response_format": {"type": "json_object"}
                }
            )
            data = resp.json()
            content = data["choices"][0]["message"]["content"]
            return json.loads(content)

    def _heuristic_analysis(self, title: str, description: str, service: str, logs: Optional[str]) -> Dict[str, Any]:
        """High-precision domain heuristic parsing for reliable demo execution."""
        text = f"{title} {description} {logs or ''}".lower()
        symptoms = []
        possible_causes = []
        error_type = "Unknown Error"
        severity = "medium"

        if "500" in text or "http 500" in text or "internal server error" in text:
            error_type = "HTTP 500"
            symptoms.append("HTTP 500 internal server errors")
            severity = "critical"
        elif "502" in text or "504" in text or "gateway" in text:
            error_type = "HTTP 504 Gateway Timeout"
            symptoms.append("Upstream gateway timeouts")
            severity = "high"
        elif "401" in text or "token" in text or "auth" in text:
            error_type = "Authentication Failure (401)"
            symptoms.append("Unauthorized authentication rejections")
            severity = "high"

        if "timeout" in text or "latency" in text:
            symptoms.append("Database query latency and connection timeouts")
            possible_causes.append("Connection pool exhaustion")
            possible_causes.append("Unindexed database query lockup")
        
        if "pool" in text or "connection" in text:
            symptoms.append("High database connection usage")
            possible_causes.append("Database connection starvation")

        if "redis" in text or "cache" in text:
            symptoms.append("Cache miss storm / Redis disconnect")
            possible_causes.append("Redis instance connection saturation")

        if "deployment" in text or "version" in text or "release" in text:
            possible_causes.append("Regression in recent code deployment")

        if not symptoms:
            symptoms = ["Service degradation reported by monitoring"]
        if not possible_causes:
            possible_causes = ["Resource saturation", "Configuration mismatch"]

        return {
            "service": service,
            "environment": "production",
            "symptoms": symptoms,
            "error_type": error_type,
            "possible_causes": possible_causes,
            "severity": severity,
            "relevant_keywords": [service, error_type, *[s.split()[0] for s in symptoms]],
            "important_technical_entities": {
                "detected_service": service,
                "protocol": "HTTP/REST",
                "infra_layer": "Application / Database"
            }
        }

llm_service = LLMService()
