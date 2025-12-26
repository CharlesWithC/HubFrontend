import aiohttp
import json

class AResponse:
    def __init__(self, status, headers, content):
        self.status_code = status
        self.headers = headers
        self.content = content

    @property
    def text(self):
        return self.content.decode('utf-8') if isinstance(self.content, bytes) else self.content

    def json(self):
        return json.loads(self.text)


class arequests:
    @classmethod
    async def request(cls, method, url, **kwargs):
        async with aiohttp.ClientSession(trust_env=True) as session:
            async with session.request(method, url, **kwargs) as response:
                content = await response.read()
                return AResponse(response.status, response.headers, content)

    @classmethod
    async def get(cls, url, **kwargs):
        return await cls.request("GET", url, **kwargs)

    @classmethod
    async def post(cls, url, **kwargs):
        return await cls.request("POST", url, **kwargs)

    @classmethod
    async def put(cls, url, **kwargs):
        return await cls.request("PUT", url, **kwargs)

    @classmethod
    async def patch(cls, url, **kwargs):
        return await cls.request("PATCH", url, **kwargs)

    @classmethod
    async def delete(cls, url, **kwargs):
        return await cls.request("DELETE", url, **kwargs)

    @classmethod
    async def head(cls, url, **kwargs):
        return await cls.request("HEAD", url, **kwargs)
