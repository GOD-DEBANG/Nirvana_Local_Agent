from setuptools import setup, find_packages

setup(
    name="nirvana-agent",
    version="1.0.0",
    packages=find_packages(),
    include_package_data=True,
    package_data={
        "nirvana_agent": ["bin/*.jar", "ai/*"],
    },
    install_requires=[
        "flask>=3.0.3",
        "google-generativeai>=0.7.2",
        "numpy>=1.26.4",
        "scipy>=1.13.0",
        "requests>=2.32.3",
        "python-dotenv>=1.0.1",
    ],
    entry_points={
        "console_scripts": [
            "nirvana-agent=nirvana_agent.cli:main",
        ],
    },
    description="Local agent services for Nirvana Web App",
    author="CFA Team",
)
